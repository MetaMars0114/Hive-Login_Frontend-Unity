import axios from 'axios';

export default axios.create({
    baseURL: "http://192.168.104.229:4002"//process.env.NODE_ENV === "production" ? 'https://back.downvotecontrol.com' : "http://localhost:4002"
});

