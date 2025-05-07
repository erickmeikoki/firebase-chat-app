import ChatContainer from "@/components/chat-container";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>FireChat - Real-time Chat App</title>
        <meta name="description" content="A real-time chat application built with React and Firebase" />
        <meta property="og:title" content="FireChat - Real-time Chat App" />
        <meta property="og:description" content="Connect and chat in real-time with FireChat" />
        <meta property="og:type" content="website" />
      </Helmet>
      <ChatContainer />
    </>
  );
}
