import axios from 'axios';

export default axios.create({
    baseURL: "http://localhost:4002"//process.env.NODE_ENV === "production" ? 'https://back.downvotecontrol.com' : "http://localhost:4002"
});

