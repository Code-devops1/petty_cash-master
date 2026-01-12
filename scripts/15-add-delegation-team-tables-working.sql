-- Create teams table for managing team assignments
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_memberships table to manage user-team relationships
CREATE TABLE IF NOT EXISTS team_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- 'member', 'senior', 'lead', etc.
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, team_id) -- Prevent duplicate memberships
);

-- Create delegations table for managing approval authority delegation
CREATE TABLE IF NOT EXISTS delegations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL, -- The person delegating authority
    delegate_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,  -- The person receiving authority
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure delegator and delegate are different people
    CONSTRAINT different_users CHECK (delegator_id != delegate_id),
    
    -- Ensure end date is after start date
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes for better performance
CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);
CREATE INDEX idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX idx_delegations_delegator_id ON delegations(delegator_id);
CREATE INDEX idx_delegations_delegate_id ON delegations(delegate_id);
CREATE INDEX idx_delegations_status ON delegations(status);
CREATE INDEX idx_delegations_dates ON delegations(start_date, end_date);

-- Create updated_at trigger for new tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_memberships_updated_at BEFORE UPDATE ON team_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delegations_updated_at BEFORE UPDATE ON delegations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for teams table
-- Teams can be viewed by members of that team or admins/managers
CREATE POLICY "Team members can view team info" ON teams 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_memberships tm
        WHERE tm.team_id = teams.id
        AND tm.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Team leaders and admins can update team info
CREATE POLICY "Team leaders and admins can update teams" ON teams 
FOR UPDATE USING (
    leader_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Admins can manage all teams
CREATE POLICY "Admins can manage all teams" ON teams 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- RLS Policies for team_memberships table
-- Members can view memberships of their own teams
CREATE POLICY "Users can view team memberships of their teams" ON team_memberships 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM teams t
        JOIN team_memberships tm ON t.id = tm.team_id
        WHERE tm.user_id = auth.uid()
        AND team_memberships.team_id = t.id
    )
    OR
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Admins and team leaders can manage team memberships
CREATE POLICY "Admins and team leaders can manage team memberships" ON team_memberships 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM teams t
        WHERE t.leader_id = auth.uid()
        AND team_memberships.team_id = t.id
    )
);

-- RLS Policies for delegations table
-- Users can view their own delegations (as delegator or delegate)
CREATE POLICY "Users can view own delegations" ON delegations 
FOR SELECT USING (
    delegator_id = auth.uid() OR delegate_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Users can insert their own delegations (as delegator)
CREATE POLICY "Users can create own delegations" ON delegations 
FOR INSERT WITH CHECK (
    delegator_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Users can update their own delegations (as delegator)
CREATE POLICY "Users can update own delegations" ON delegations 
FOR UPDATE USING (
    delegator_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);