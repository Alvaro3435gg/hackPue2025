import React from "react";
import prevTopicImg from "../assets/prevTopic.png";
import nextTopicImg from "../assets/nextTopic.png";
import "./TopicsNavigation.css";

interface TopicNavigatorProps {
  text: string;
  prevUrl: string;
  nextUrl: string;
}

const TopicNavigator: React.FC<TopicNavigatorProps> = ({ text, prevUrl, nextUrl }) => {
  return (
    <div className="topic-navigator">
      <a href={prevUrl}>
        <img src={prevTopicImg} alt="Previous topic" className="nav-button" />
      </a>

      <span className="topic-title">{text}</span>

      <a href={nextUrl}>
        <img src={nextTopicImg} alt="Next topic" className="nav-button" />
      </a>
    </div>
  );
};

export default TopicNavigator;