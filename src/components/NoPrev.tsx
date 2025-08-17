import React from "react";
import nextTopicImg from "../assets/nextTopic.png";
import "./TopicsNavigation.css";

interface TopicNavigatorProps {
  text: string;
  nextUrl: string;
}

const TopicNavigator: React.FC<TopicNavigatorProps> = ({ text, nextUrl }) => {
  return (
    <div className="topic-navigator">

      <span className="topic-title">{text}</span>

      <a href={nextUrl}>
        <img src={nextTopicImg} alt="Next topic" className="nav-button" />
      </a>
    </div>
  );
};

export default TopicNavigator;