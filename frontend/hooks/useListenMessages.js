import { useEffect } from "react";

import { useSocketContext } from "../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import {
	setMsg,
} from "@/lib/Features/Conversations/conversationSlice";

const useListenMessages = () => {
	const dispatch = useDispatch();
	const { socket } = useSocketContext();
	const msg = useSelector((state) => state.conversation.value);

	useEffect(() => {
		socket?.on("newMessage", (newMessage) => {
			// newMessage.shouldShake = true;
			// const sound = new Audio(notificationSound);
			// sound.play();
			msg ? dispatch(setMsg([...msg, newMessage])) : dispatch(setMsg([newMessage]));
			// dispatch(setSendMsg());
		});

		return () => socket?.off("newMessage");
	}, [socket, setMsg, msg]);
};
export default useListenMessages;
