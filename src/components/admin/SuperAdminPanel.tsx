
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, MapPin, Settings } from 'lucide-react';
import { ClubManager } from './ClubManager';
import { CourseManager } from './CourseManager';
import { MemberManager } from './MemberManager';

interface SuperAdminPanelProps {
  user: any;
}

export const SuperAdminPanel = ({ user }: SuperAdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('clubs');

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <Card className="border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
          <div className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl font-light">
              <Settings className="w-6 h-6 text-accent" />
              Super Admin Panel
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 mt-1">
              Manage clubs, courses, and members across the platform
            </CardDescription>
          </div>
        </div>
      </Card>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clubs" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Clubs
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clubs" className="mt-6">
          <ClubManager user={user} />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <CourseManager user={user} />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <MemberManager user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
