import { Link, Routes, Route, Navigate } from "react-router-dom";
import { NavBarItem } from "../components/NavBarItem";
import { NavBar } from "../components/NavBar";
import { ProfilePage } from "./ProfilePage";
import { FriendsPage } from "./FriendsPage";
import { ChatsPage } from "./ChatsPage";
import { ChatPage } from "./ChatPage";
import { MediaPage } from "./MediaPage";
import { AllMedia } from "../components/AllMedia";
import { GroupPage } from "./GroupPage";
import { AllFriends } from "./AllFriends";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export function Main() {
    const [authUser] = useContext(AuthContext)

    if (!authUser) return

    return (
        <main className="main">
            <Routes>
                <Route path="/baeq-social/profile/:id" element={<ProfilePage />} />
                <Route path="/baeq-social/friends/:id" element={<FriendsPage />}/>
                <Route path="/baeq-social/allFriends" element={<AllFriends/>} />
                <Route path="/baeq-social/groups/:id" element={<FriendsPage groups/>} />
                <Route path="/baeq-social/groups/group/:id" element={<GroupPage/>}/>
                <Route path="/baeq-social/allGroups" element={<AllFriends groups/>}/>
                <Route path="/baeq-social/chats" element={<ChatsPage />}/>
                <Route path="/baeq-social/chats/:id" element={<ChatPage />}/>
                <Route path="/baeq-social/photos/:id/*" element={<MediaPage type="photos"/>}/>
                <Route path="/baeq-social/allPhotos/*" element={<AllMedia type="photos"/>}/>
                <Route path="/baeq-social/videos/:id/*" element={<MediaPage type="videos"/>} />
                <Route path="/baeq-social/allVideos/*" element={<AllMedia type="videos"/>}/>
                <Route path="/baeq-social/music/:id/*" element={<MediaPage type="music"/>} />
                <Route path="/baeq-social/allMusic/*" element={<AllMedia type="music"/>}/>
                <Route path="*" element={<Navigate to={`/baeq-social/profile/${authUser?.id}`} />}/>
            </Routes>
            <NavBar />
        </main>
    )
}