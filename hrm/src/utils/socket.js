import { io } from "socket.io-client";
import { BASE_URL } from "./api";

const socket = io(BASE_URL, {
    withCredentials: true,
    autoConnect: true,
});

export default socket;
