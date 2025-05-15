import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileUpdateForm from "@/features/settings/ProfileUpdateForm";
import ChangePasswordForm from "@/features/settings/ChangePasswordForm";
import { Card } from "@/components/ui/card";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Account Settings</h2>
      
      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        
        <Card className="mt-6">
          <TabsContent value="profile" className="p-4">
            <ProfileUpdateForm />
          </TabsContent>
          
          <TabsContent value="password" className="p-4">
            <ChangePasswordForm />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Settings;
