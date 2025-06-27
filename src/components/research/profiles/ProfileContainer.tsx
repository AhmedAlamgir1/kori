
import React from "react";
import { RespondentProfile } from "../profile/types";

interface ProfileContainerProps {
  opportunity: string;
  children: React.ReactNode;
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({
  opportunity,
  children
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-2xl font-bold">User Profiles Inspiration Board</h3>
        <p className="text-blue-200/80">
          These imaginary profiles represent diverse fictional respondents who might provide unique insights about your opportunity:
          <span className="italic ml-2 text-indigo-300">{opportunity}</span>
        </p>
        <p className="text-blue-200/60 text-sm">
          <em>Although these profiles are fictional, we hope it inspires you to diversify your respondent pool in real life.</em>
        </p>
      </div>
      {children}
    </div>
  );
};

export default ProfileContainer;
