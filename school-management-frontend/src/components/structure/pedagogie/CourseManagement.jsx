import React from 'react';
import CourseManagerDashboard from '../../dashboard/pedagogieDashboard/CourseManagerDashboard';
import CourseClassAssignmentBuilder from './CourseClassAssignmentBuilder';

const CourseManagement = () => {
  return (
    <div className="animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto pb-6 px-3 sm:px-4 lg:px-6">
      {/* Dashboard de synthèse */}
      <CourseManagerDashboard />

      {/* Zone Principale : Gestion Hiérarchique stricte */}
      <div className="transition-all duration-300 w-full mt-6">
        <CourseClassAssignmentBuilder />
      </div>
    </div>
  );
};

export default CourseManagement;