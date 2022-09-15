import { combineReducers } from "redux";

const _ = require('lodash');

const userReducer = (state = "", action) => {

    if (action.type === "LOGIN") {
        console.log('called Login reducer==========', action.payload)
        return action.payload;
    } else if (action.type === "FETCH_LOGIN") {
        return action.payload;
    } else if (action.type === "LOGOUT") {
        return ""
    } else if (action.type === "SET_DV_THRESHOLD") {
        let new_state = _.cloneDeep(state);

        new_state.dv_threshold = action.payload;
        return new_state
    } else if (action.type === "SET_VP_THRESHOLD") {
        let new_state = _.cloneDeep(state);

        new_state.vp_threshold = action.payload;
        return new_state
    } else if (action.type === "SET_PAYOUT") {
        let new_state = _.cloneDeep(state);

        new_state.min_payout = action.payload;
        return new_state
    } else if (action.type === "SET_REVOTE") {
        let new_state = _.cloneDeep(state);

        if (state.revote === undefined)
            new_state.revote = true;
        else
            new_state.revote = !state.revote;

        return new_state
    }

    return state;
};

const dataReducer = (state = { negative_trail: "", positive_trail: "", counter_trail: "", whitelist: "", hitlist: "", vote_history: "", counter_dv_blacklist: "" }, action) => {

    if (action.type === "FETCH_TRAILS") {
        let new_state = _.cloneDeep(state);

        new_state.positive_trail = action.payload.filter(el => el.type === 1);
        new_state.negative_trail = action.payload.filter(el => el.type === -1);
        new_state.counter_trail = action.payload.filter(el => el.type === 2);

        return new_state
    } else if (action.type === "ADD_TRAIL") {
        let new_state = _.cloneDeep(state);

        let trail = action.payload;

        if (trail.trail_type === 1) {
            new_state.positive_trail.push(action.payload);
        } else if (trail.trail_type === -1) {
            new_state.negative_trail.push(action.payload);
        } else if (trail.trail_type === 2) {
            new_state.counter_trail.push(action.payload);
        }

        return new_state
    } else if (action.type === "REMOVE_TRAIL") {
        let new_state = _.cloneDeep(state);

        let trail = action.payload;

        if (trail.trail_type === 1)
            new_state.positive_trail = state.positive_trail.filter(el => el.trailed !== trail.trailed);
        else if (trail.trail_type === -1)
            new_state.negative_trail = state.negative_trail.filter(el => el.trailed !== trail.trailed);
        else if (trail.trail_type === 2)
            new_state.counter_trail = state.counter_trail.filter(el => el.trailed !== trail.trailed);

        return new_state
    } else if (action.type === "FETCH_WHITELIST") {
        let new_state = _.cloneDeep(state);
        new_state.whitelist = action.payload;
        return new_state
    } else if (action.type === "FETCH_COUNTER_DV_BLACKLIST") {
        let new_state = _.cloneDeep(state);
        new_state.counter_dv_blacklist = action.payload;
        return new_state
    } else if (action.type === "ADD_WHITELIST") {
        let new_state = _.cloneDeep(state);
        new_state.whitelist.push(action.payload);
        return new_state
    } else if (action.type === "ADD_COUNTER_DV_BLACKLIST") {
        let new_state = _.cloneDeep(state);
        new_state.counter_dv_blacklist.push(action.payload);
        return new_state
    } else if (action.type === "ADD_HITLIST") {
        let new_state = _.cloneDeep(state);
        new_state.hitlist.push(action.payload);
        return new_state
    } else if (action.type === "REMOVE_WHITELIST") {
        let new_state = _.cloneDeep(state);
        new_state.whitelist = state.whitelist.filter(el => el.trailed !== action.payload.trailed);
        return new_state
    } else if (action.type === "REMOVE_COUNTER_DV_BLACKLIST") {
        let new_state = _.cloneDeep(state);
        new_state.counter_dv_blacklist = state.counter_dv_blacklist.filter(el => el.trailed !== action.payload.trailed);
        return new_state
    } else if (action.type === "FETCH_HITLIST") {
        let new_state = _.cloneDeep(state);
        new_state.hitlist = action.payload;
        return new_state
    } else if (action.type === "REMOVE_HITLIST") {
        let new_state = _.cloneDeep(state);
        new_state.hitlist = state.hitlist.filter(el => el.author !== action.payload.author);
        return new_state
    } else if (action.type === "FETCH_VOTES") {
        let new_state = _.cloneDeep(state);
        new_state.vote_history = action.payload.map(el => { el.loading = false; return el });
        return new_state
    } else if (action.type === "UNVOTE") {
        let new_state = _.cloneDeep(state);
        new_state.vote_history = state.vote_history.filter(el => el.author !== action.payload.author && el.permlink !== action.payload.permlink);
        return new_state
    } else if (action.type === "UNVOTING") {
        let new_state = _.cloneDeep(state);

        for (let i = 0; i < new_state.vote_history.length; i++) {
            let vote = new_state.vote_history[i];

            if (vote.author === action.payload.author && vote.permlink === action.payload.permlink)
                new_state.vote_history[i].loading = true;
        }

        return new_state
    } else if (action.type === "UNVOTE_FAIL") {
        let new_state = _.cloneDeep(state);

        for (let i = 0; i < new_state.vote_history.length; i++) {
            let vote = new_state.vote_history[i];

            if (vote.author === action.payload.author && vote.permlink === action.payload.permlink)
                new_state.vote_history[i].loading = false;
        }

        return new_state
    }


    return state;

};



export default combineReducers({
    user: userReducer,
    data: dataReducer
})