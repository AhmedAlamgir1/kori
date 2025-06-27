
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRound } from "lucide-react";
import { UserProfile } from "./types";

interface SyntheticUserFormProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSubmit: (e: React.FormEvent) => void;
}

const SyntheticUserForm: React.FC<SyntheticUserFormProps> = ({
  userProfile,
  setUserProfile,
  onSubmit
}) => {
  return (
    <Card className="bg-slate-800/60 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-5 w-5" />
          Create Synthetic User Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                placeholder="e.g., 32" 
                value={userProfile.age}
                onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input 
                id="gender" 
                placeholder="e.g., Woman, Man, Non-binary" 
                value={userProfile.gender}
                onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input 
                id="occupation" 
                placeholder="e.g., Software Engineer" 
                value={userProfile.occupation}
                onChange={(e) => setUserProfile({...userProfile, occupation: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">Interests (Optional)</Label>
              <Input 
                id="interests" 
                placeholder="e.g., Hiking, Reading" 
                value={userProfile.interests}
                onChange={(e) => setUserProfile({...userProfile, interests: e.target.value})}
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-4">Create Profile & Start Chat</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SyntheticUserForm;
