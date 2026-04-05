import React from "react";

interface TutorialCardProps {
  title: string;
  videoUrl: string;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ title, videoUrl }) => {
  return (
    <div className="col-12 col-md-6 mb-5">
      <h4 className="tutorial-title">{title}</h4>
      <div className="ratio ratio-16x9">
        <iframe
          src={videoUrl}
          title={title}
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default TutorialCard;