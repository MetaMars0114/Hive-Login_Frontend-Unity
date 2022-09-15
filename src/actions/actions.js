import backend from "../api/backend";
import Cookies from "universal-cookie";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';

const utils = require("../api/utils");

var dhive = require('@hivechain/dhive');
var client = new dhive.Client('https://anyx.io');

const fetchLogin = () => async (dispatch) => {

    const cookies = new Cookies();

    let logged_user = "";
    if (cookies.get("username") !== undefined && cookies.get("token") !== undefined && cookies.get("type") !== undefined) {
        const response = (await backend.post('/auth/user',
            { username: cookies.get("username"), token: cookies.get("token"), type: cookies.get("type") })).data;

        if (response.status === "ok") {

            let hive_data = await client.database.getAccounts([cookies.get("username")]);

            hive_data = hive_data[0];

            logged_user = {
                username: cookies.get("username"),
                token: cookies.get("token"),
                hive_data: hive_data,
                voting_power: Math.ceil(utils.getvotingpower(hive_data) * 100) / 100,
                downvoting_power: Math.ceil(utils.downvotingpower(hive_data) * 100) / 100,
                vp_threshold: response.vp_threshold,
                dv_threshold: response.dv_threshold,
                min_payout: response.min_payout,
                revote: response.revote,
                type: cookies.get("type"),

            };
        }
    }

    dispatch({
        type: 'FETCH_LOGIN',
        payload: logged_user
    });
};


const login = (data) => async (dispatch) => {

    const cookies = new Cookies();

    let next_week = new Date();

    next_week.setDate(next_week.getDate() + 14);

    let name = data.name;
    let profile_image = "https://steemitimages.com/u/" + name + "/avatar";

    cookies.set('username', data.username, { path: '/', expires: next_week });
    cookies.set('token', data.token, { path: '/', expires: next_week });
    cookies.set('type', "hivesigner", { path: '/', expires: next_week });

    let hive_data = await client.database.getAccounts([data.username]);

    hive_data = hive_data[0];

    let logged_user = {
        username: data.username,
        token: data.token,
        avatar: profile_image,
        hive_data: hive_data,
        voting_power: Math.ceil(utils.getvotingpower(hive_data) * 100) / 100,
        downvoting_power: Math.ceil(utils.downvotingpower(hive_data) * 100) / 100,
        vp_threshold: data.vp_threshold,
        dv_threshold: data.dv_threshold,
        min_payout: data.min_payout,
        revote: data.revote,
        type: "hivesigner"
    };

    dispatch({
        type: 'LOGIN',
        payload: logged_user
    });
};

const fetchTrails = (username, token, type) => async (dispatch) => {

    const response = (await backend.post('/settings/get_trail',
        { username: username, token: token, type: type })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'FETCH_TRAILS',
            payload: response.data
        });
    }
};

const fetchWhitelist = (username, token, type) => async (dispatch) => {

    const response = (await backend.post('/settings/get_whitelist',
        { username: username, token: token, type: type })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'FETCH_WHITELIST',
            payload: response.data
        });
    }
};

const fetchCounterDvBlacklist = (username, token, type) => async (dispatch) => {

    const response = (await backend.post('/settings/get_counter_dv_blacklist',
        { username: username, token: token, type: type })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'FETCH_COUNTER_DV_BLACKLIST',
            payload: response.data
        });
    }
};

const fetchHitlist = (username, token, type) => async (dispatch) => {

    const response = (await backend.post('/settings/get_hitlist',
        { username: username, token: token, type: type })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'FETCH_HITLIST',
            payload: response.data
        });
    }
};

const fetchExecutedVotes = (username, token, type) => async (dispatch) => {

    const response = (await backend.post('/settings/get_vote_history',
        { username: username, token: token, type: type })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'FETCH_VOTES',
            payload: response.data
        });
    }
};


const addToTrail = (username, token, type, trailed, ratio, trail_type) => async (dispatch) => {

    let account = await client.database.getAccounts([trailed]);

    if (account.length === 0) {
        toast.error("User " + trailed + " doesn't exists");
        return;
    }

    const response = (await backend.post('/settings/add_trail',
        { username: username, token: token, type, trailed, ratio, trail_type })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'ADD_TRAIL',
            payload: {
                username,
                trailed,
                ratio,
                trail_type
            }
        });
    } else {
        if (response.error === "already exists") {
            toast.error("This user is already trailed, either in a negative or a normal trail")
        }
    }
};

const addToWhitelist = (username, token, type, trailed) => async (dispatch) => {
    let account = await client.database.getAccounts([trailed]);

    if (account.length === 0) {
        toast.error("User " + trailed + " doesn't exists");
        return;
    }

    const response = (await backend.post('/settings/add_whitelist',
        { username: username, token: token, type, trailed })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'ADD_WHITELIST',
            payload: {
                username,
                trailed
            }
        });
    } else {
        if (response.error === "already exists") {
            toast.error("This user is already in the whitelist")
        }
    }
};


const addToCounterDvBlacklist = (username, token, type, trailed) => async (dispatch) => {
    let account = await client.database.getAccounts([trailed]);

    if (account.length === 0) {
        toast.error("User " + trailed + " doesn't exists");
        return;
    }

    const response = (await backend.post('/settings/add_counter_dv_blacklist',
        { username: username, token: token, type, trailed })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'ADD_COUNTER_DV_BLACKLIST',
            payload: {
                username,
                trailed
            }
        });
    } else {
        if (response.error === "already exists") {
            toast.error("This user is already in the counter downvote blacklist")
        }
    }
};


const addToHitlist = (username, token, type, author, percent, min_payout) => async (dispatch) => {
    let account = await client.database.getAccounts([author]);

    if (account.length === 0) {
        toast.error("User " + author + " doesn't exists");
        return;
    }

    const response = (await backend.post('/settings/add_hitlist',
        { username: username, token: token, type, author, percent, min_payout })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'ADD_HITLIST',
            payload: {
                username,
                author,
                percent,
                min_payout
            }
        });
    } else {
        if (response.error === "already exists") {
            toast.error("This user is already in the hitlist")
        }
    }
};


const removeTrail = (username, token, type, trailed, trail_type) => async (dispatch) => {

    const response = (await backend.post('/settings/remove_trail',
        { username: username, token: token, type, trailed, trail_type })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'REMOVE_TRAIL',
            payload: {
                trailed,
                trail_type
            }
        });
    }
};

const removeWhitelist = (username, token, type, trailed) => async (dispatch) => {

    const response = (await backend.post('/settings/remove_whitelist',
        { username: username, token: token, type, trailed })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'REMOVE_WHITELIST',
            payload: {
                trailed
            }
        });
    }
};

const removeCounterDvBlacklist = (username, token, type, trailed) => async (dispatch) => {

    const response = (await backend.post('/settings/remove_counter_dv_blacklist',
        { username: username, token: token, type, trailed })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'REMOVE_COUNTER_DV_BLACKLIST',
            payload: {
                trailed
            }
        });
    }
};

const removeHitlist = (username, token, type, author) => async (dispatch) => {

    const response = (await backend.post('/settings/remove_hitlist',
        { username: username, token: token, type, author })).data;

    if (response.status === "ok") {
        return dispatch({
            type: 'REMOVE_HITLIST',
            payload: {
                author
            }
        });
    }
};

const saveSettings = (user) => async () => {
    const response = (await backend.post('/settings/update_user_settings',
        {
            username: user.username,
            token: user.token,
            type: user.type,
            settings: JSON.stringify({
                dv_threshold: user.dv_threshold,
                vp_threshold: user.vp_threshold,
                min_payout: user.min_payout,
                revote: user.revote,
            }),
        })).data;

    if (response.status === "ok")
        toast.info("Settings saved");
};

const setDvThreshold = (threshold) => async (dispatch) => {
    return dispatch({
        type: 'SET_DV_THRESHOLD',
        payload: threshold
    });
};

const setVpThreshold = (threshold) => async (dispatch) => {
    return dispatch({
        type: 'SET_VP_THRESHOLD',
        payload: threshold
    });
};

const setMinPayout = (payout) => async (dispatch) => {
    return dispatch({
        type: 'SET_PAYOUT',
        payload: payout
    });
};

const setRevote = () => async (dispatch) => {

    return dispatch({
        type: 'SET_REVOTE',
    });
};

const logout = (username, token, type) => async (dispatch) => {
    const cookies = new Cookies();

    cookies.remove("login");
    cookies.remove("username");
    cookies.remove("token");

    await backend.post('/auth/logout', { username: username, token: token, type: type });

    dispatch({
        type: 'LOGOUT',
        payload: ""
    });
};

const unvote = (username, token, type, author, permlink) => async (dispatch) => {

    dispatch({
        type: 'UNVOTING',
        payload: { author: author, permlink: permlink }
    });

    let data = (await backend.post('/settings/unvote', { username, token, type, author, permlink })).data;

    if (data.status === "ko") {
        dispatch({
            type: 'UNVOTE_FAIL',
            payload: { author: author, permlink: permlink }
        });
        toast.error(data.data);
    } else {
        toast.info("Successfully unvoted @" + author + "/" + permlink);
        dispatch({
            type: 'UNVOTE',
            payload: { author: author, permlink: permlink }
        });
    }
};

const login_keychain = (username, encrypted_username) => async (dispatch) => {

    let data = (await backend.post('/auth/keychain/login', { username, encrypted_username })).data;
    console.log('data in login_keychain of action', data)

    if (data.status === "ok") {
        data = data.account;

        const cookies = new Cookies();

        let next_week = new Date();

        next_week.setDate(next_week.getDate() + 14);

        let profile_image = "https://steemitimages.com/u/" + username + "/avatar";

        cookies.set('username', data.username, { path: '/', expires: next_week });
        cookies.set('token', data.token, { path: '/', expires: next_week });
        cookies.set('type', "keychain", { path: '/', expires: next_week });

        let hive_data = await client.database.getAccounts([username]);

        hive_data = hive_data[0];

        let logged_user = {
            username: username,
            token: data.token,
            avatar: profile_image,
            hive_data: hive_data,
            voting_power: Math.ceil(utils.getvotingpower(hive_data) * 100) / 100,
            downvoting_power: Math.ceil(utils.downvotingpower(hive_data) * 100) / 100,
            vp_threshold: data.vp_threshold,
            dv_threshold: data.dv_threshold,
            min_payout: data.min_payout,
            type: "keychain",
            revote: data.revote,
        };

        dispatch({
            type: 'LOGIN',
            payload: logged_user
        });
    }



};



export {

    fetchLogin,
    login,
    fetchTrails,
    addToTrail,
    removeTrail,
    saveSettings,
    setDvThreshold,
    setVpThreshold,
    logout,
    setMinPayout,
    login_keychain,
    addToWhitelist,
    fetchWhitelist,
    removeWhitelist,
    fetchHitlist,
    removeHitlist,
    addToHitlist,
    fetchExecutedVotes,
    unvote,
    setRevote,
    addToCounterDvBlacklist,
    fetchCounterDvBlacklist,
    removeCounterDvBlacklist


};