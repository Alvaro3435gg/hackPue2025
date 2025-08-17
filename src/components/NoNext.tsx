import React from "react";
import prevTopicImg from "../assets/prevTopic.png";
import "./TopicsNavigation.css";

interface TopicNavigatorProps {
  text: string;
  prevUrl: string;
}

const TopicNavigator: React.FC<TopicNavigatorProps> = ({ text, prevUrl }) => {
  return (
    <div className="topic-navigator">
      <a href={prevUrl}>
        <img src={prevTopicImg} alt="Previous topic" className="nav-button" />
      </a>

      <span className="topic-title">{text}</span>
    </div>
  );
};

export default TopicNavigator;