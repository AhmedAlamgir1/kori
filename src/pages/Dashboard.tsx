import React from "react";
import { BookOpen, Lightbulb, Home, HomeIcon, User, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { fetchAllUserChats } from '@/utils/api/chatApi';
import { useChatStore } from '@/stores/useChatStore';
import { Link } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();
  const { chats, setChats } = useChatStore();
  const [chatError, setChatError] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  useEffect(() => {
    async function loadChats() {
      try {
        const data = await fetchAllUserChats();
        setChats(data.data?.chats || []);
        setChatError(false);
      } catch (e) {
        setChatError(true);
      }
    }
    loadChats();
  }, [setChats]);

  const handleChatClick = (chatId: string) => {
    useChatStore.getState().setSelectedChatId(chatId);
    navigate('/prompts');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const optionCards = [
    {
      id: 2,
      title: "Understand",
      icon: <BookOpen className="w-10 h-10 text-white" />,
      description: "Your research co-pilot to gain deeper insight to your opportunity or problem",
      path: "/understand",
      delay: 0.2
    },
    {
      id: 3,
      title: "Ideate",
      icon: <Lightbulb className="w-10 h-10 text-white" />,
      description: "Your creative co-pilot to generate digital product solutions to problems",
      path: "/innovate",
      delay: 0.3
    },
    // {
    //   id: 4,
    //   title: "Lead",
    //   icon: <UserCheck className="w-10 h-10 text-white" />,
    //   description: "Coming Soon",
    //   path: "/coming-soon",
    //   delay: 0.4
    // },
    // {
    //   id: 5,
    //   title: "Design",
    //   icon: <PenTool className="w-10 h-10 text-white" />,
    //   description: "Coming Soon",
    //   path: "/coming-soon",
    //   delay: 0.5
    // }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-slate-900 to-indigo-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 backdrop-blur-md border-r border-indigo-500/30 p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-10 text-center">Kori Dashboard</h1>
        <nav className="space-y-4">
          <a href="#" className="flex items-center gap-3 text-white hover:text-indigo-400 transition">
            <HomeIcon /> Dashboard
          </a>
          {/* <a href="#" className="flex items-center gap-3 text-white hover:text-indigo-400 transition">
            <User /> Profile
          </a> */}
          <Link to="/settings" className="flex items-center gap-3 text-white hover:text-indigo-400 transition">
            <Settings /> Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-white hover:text-red-400 transition w-full text-left"
          >
            <LogOut /> Logout
          </button>
          <h1 className="text-white text-xl mb-2">
            Chats
          </h1>
          {chatError ? (
            <div className="text-red-400 text-sm mt-2">some error occured while fetching chats, try again after some time</div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[400px]">
              {chats.map((chat) => (
                <div key={chat._id}
                 className="bg-slate-700/60 rounded px-3 py-2 text-sm text-blue-200 cursor-pointer"
                  onClick={() => handleChatClick(chat._id)}>
                  {chat.initialPrompt}
                </div>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        {/* Top navbar */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold">Welcome back, {user?.fullName}!</h2>
          {/* <div className="text-sm text-gray-300">Last login: 2 hours ago</div> */}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-relaxed animate-text-gradient bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-300% relative py-2">
            Hello Innovator, what are we building today?
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-innovation-surface">
            Kori is your innovation co-pilot, inspiring and learning with you
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 max-w-6xl w-full mx-auto place-items-center items-center justify-items-center">
          {optionCards.map(card => (
            <motion.div
              key={card.id}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(79, 70, 229, 0.6)"
              }}
              className="card-width bg-gradient-to-br from-indigo-800/40 to-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl overflow-hidden cursor-pointer group h-[180px]"
              onClick={() => { navigate(card.path); }}
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-center mb-2">
                  {card.icon}
                </div>
                <h2 className="text-xl font-bold mb-1.5 text-white group-hover:text-blue-300 transition-colors text-center">
                  {card.title}
                </h2>
                <p className="text-blue-200/80 text-sm text-center">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </main>
    </div>
  );
};

export default Dashboard;
