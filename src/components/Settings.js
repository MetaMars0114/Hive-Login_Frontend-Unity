import React from 'react';
import { connect } from "react-redux";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import {
    login,
    fetchLogin,
    fetchTrails,
    fetchExecutedVotes,
    unvote,
    setVpThreshold,
    fetchHitlist,
    removeHitlist,
    addToHitlist,
    addToTrail,
    removeTrail,
    logout,
    setMinPayout,
    addToWhitelist,
    fetchWhitelist,
    removeWhitelist,
    setDvThreshold,
    saveSettings, setRevote, addToCounterDvBlacklist, removeCounterDvBlacklist
} from "../actions/actions";
//fetchCounterDvBlacklist
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "@devexpress/dx-react-grid";
import { Grid, PagingPanel, SearchPanel, Table, TableHeaderRow, Toolbar } from "@devexpress/dx-react-grid-bootstrap4";
import { IntegratedFiltering, IntegratedPaging, PagingState, SearchState, IntegratedSorting, SortingState } from "@devexpress/dx-react-grid";
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';
import { SyncLoader } from 'react-spinners';
import moment from 'moment';

const Joi = require('joi');

class Settings extends React.Component {
    state = { trail_username: "", trail_ratio: 1, hitlist_percent: 50, hitlist_min_payout: 5 };

    async componentDidMount() {
        this.props.fetchTrails(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type);
        this.props.fetchWhitelist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type);
        this.props.fetchHitlist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type);
        // this.props.fetchCounterDvBlacklist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type);
        this.props.fetchExecutedVotes(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type);
    };

    trailed_schema = Joi.object().keys({
        username: Joi.string().min(3).max(16).required(),
        ratio: Joi.number().min(0.01).max(2.5),
    });

    whitelist_schema = Joi.object().keys({
        username: Joi.string().min(3).max(16).required(),
    });

    counter_dv_blacklist_schema = Joi.object().keys({
        username: Joi.string().min(3).max(16).required(),
    });

    hitlist_schema = Joi.object().keys({
        username: Joi.string().min(3).max(16).required(),
        percent: Joi.number().min(0.01).max(100),
        min_payout: Joi.number().min(0.01),
    });


    remove_trail = (trailed, type) => {
        this.props.removeTrail(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, trailed, type);
    };

    remove_whitelist = (author) => {
        this.props.removeWhitelist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, author);
    };

    remove_counter_dv_blacklist = (author) => {
        this.props.removeCounterDvBlacklist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, author);
    };

    remove_hitlist = (author) => {
        this.props.removeHitlist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, author);
    };

    save_settings = (event) => {
        event.preventDefault();

        this.props.saveSettings(this.props.logged_user);

    };

    save_min_payout = (event) => {
        event.preventDefault();
        this.props.saveMinPayout(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, this.props.logged_user.min_payout);
    };


    render_negative_trails = () => {
        let rows = [];
        for (let i = 0; i < this.props.data.negative_trail.length; i++) {
            rows.push(<tr>
                <td>{this.props.data.negative_trail[i].trailed}</td>
                <td>{this.props.data.negative_trail[i].ratio}</td>
                <td><button className={"btn btn-primary"} onClick={() => this.remove_trail(this.props.data.negative_trail[i].trailed, -1)}>Delete</button></td>
            </tr>)
        }

        return rows

    };

    render_positive_trails = () => {
        let rows = [];
        for (let i = 0; i < this.props.data.positive_trail.length; i++) {
            rows.push(<tr>
                <td>{this.props.data.positive_trail[i].trailed}</td>
                <td>{this.props.data.positive_trail[i].ratio}</td>
                <td><button className={"btn btn-primary"} onClick={() => this.remove_trail(this.props.data.positive_trail[i].trailed, 1)}>Delete</button></td>
            </tr>)
        }

        return rows
    };

    render_whitelist = () => {
        let rows = [];
        for (let i = 0; i < this.props.data.whitelist.length; i++) {
            rows.push(<tr>
                <td>{this.props.data.whitelist[i].trailed}</td>
                <td><button className={"btn btn-primary"} onClick={() => this.remove_whitelist(this.props.data.whitelist[i].trailed)}>Delete</button></td>
            </tr>)
        }

        return rows
    };

    render_counter_downvote_blacklist = () => {
        let rows = [];

        for (let i = 0; i < this.props.data.counter_dv_blacklist.length; i++) {
            rows.push(<tr>
                <td>{this.props.data.counter_dv_blacklist[i].trailed}</td>
                <td><button className={"btn btn-primary"} onClick={() => this.remove_counter_dv_blacklist(this.props.data.counter_dv_blacklist[i].trailed)}>Delete</button></td>
            </tr>)
        }

        return rows
    };

    render_hitlist = () => {
        let rows = [];
        for (let i = 0; i < this.props.data.hitlist.length; i++) {
            rows.push(<tr>
                <td>{this.props.data.hitlist[i].author}</td>
                <td>{this.props.data.hitlist[i].percent} %</td>
                <td>{this.props.data.hitlist[i].min_payout} $</td>
                <td><button className={"btn btn-primary"} onClick={() => this.remove_hitlist(this.props.data.hitlist[i].author)}>Delete</button></td>
            </tr>)
        }

        return rows
    };

    render_counter_downvote_trail = () => {
        let rows = [];
        for (let i = 0; i < this.props.data.counter_trail.length; i++) {
            rows.push(<tr>
                <td>{this.props.data.counter_trail[i].trailed}</td>
                <td>{this.props.data.counter_trail[i].ratio}</td>
                <td><button className={"btn btn-primary"} onClick={() => this.remove_trail(this.props.data.counter_trail[i].trailed, 2)}>Delete</button></td>
            </tr>)
        }

        return rows

    };

    add_trail = (event, type) => {
        event.preventDefault();
        let test = Joi.validate({ username: this.state.trail_username, ratio: this.state.trail_ratio }, this.trailed_schema);
        if (test.error === null)
            this.props.addToTrail(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, this.state.trail_username, this.state.trail_ratio, type);
        else
            toast.error(test.error.details[0].message);
    };

    add_whitelist = (event) => {
        event.preventDefault();
        let test = Joi.validate({ username: this.state.trail_username }, this.whitelist_schema);

        if (test.error === null)
            this.props.addToWhitelist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, this.state.trail_username);
        else
            toast.error(test.error.details[0].message);
    };

    add_counter_dv_blacklist = (event) => {
        event.preventDefault();
        let test = Joi.validate({ username: this.state.trail_username }, this.counter_dv_blacklist_schema);

        if (test.error === null)
            this.props.addToCounterDvBlacklist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, this.state.trail_username);
        else
            toast.error(test.error.details[0].message);
    };

    add_hitlist = (event) => {
        event.preventDefault();
        let test = Joi.validate({ username: this.state.trail_username, percent: this.state.hitlist_percent, min_payout: this.state.hitlist_min_payout }, this.hitlist_schema);

        if (test.error === null)
            this.props.addToHitlist(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, this.state.trail_username, this.state.hitlist_percent, this.state.hitlist_min_payout);
        else
            toast.error(test.error.details[0].message);
    };

    logout = () => {
        this.props.logout(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type);
    };

    unvote = (username, permlink) => {

        this.props.unvote(this.props.logged_user.username, this.props.logged_user.token, this.props.logged_user.type, username, permlink);
    };

    parse_vote_reason(reason, type) {
        try {
            reason = JSON.parse(reason);
        } catch (e) {
            return { trailed: "error", reason: "error" }
        }

        if (type < 3 && reason.trail !== null) {
            let trail = reason.trail;

            if (type === -1)
                return { trailed: trail.trailed, reason: "counter upvote" };
            else if (type === 1)
                return { trailed: trail.trailed, reason: "trailed downvote" };
            else if (type === 2)
                return { trailed: trail.trailed, reason: "countered downvote" };
        } else if (type === 3 && reason.hitlist !== null)
            return { trailed: reason.hitlist.author, reason: "hitlist" };

        return { trailed: "error", reason: "error" }
    }

    renderRows() {
        let votes = this.props.data.vote_history;
        let rows = [];

        for (let i = 0; i < votes.length; i++) {

            let button = "Unvote";

            if (votes[i].loading === true) {
                button = <div className='sweet-loading'>
                    <SyncLoader

                        sizeUnit={"px"}
                        size={4}
                        color={'#ffffff'}
                        loading={true}
                    />
                </div>
            }

            let vote_date = moment.unix(votes[i].date).format("DD/MM/YY HH:mm");

            let reason = this.parse_vote_reason(votes[i].reason, votes[i].type);
            rows.push({
                author: votes[i].author,
                permlink: <span><a rel="noopener noreferrer" target={"_blank"} href={"https://hive.blog/@" + votes[i].author + "/" + votes[i].permlink}> {votes[i].permlink}</a> <br /> <a style={{ fontSize: "10px", position: "relative", top: "-10px" }} rel="noopener noreferrer" target={"_blank"} href={"https://hiveblocks.com/@" + votes[i].author + "/" + votes[i].permlink}> view in hiveblocks</a></span>,
                percentage: (reason.reason !== "hitlist" ? votes[i].percentage / 100 + " %" : votes[i].percentage + " %"),
                trailed: reason.trailed,
                reason: reason.reason,
                date: vote_date,
                unvote: <button className={"btn btn-primary"} style={{ marginLeft: "5px" }} onClick={() => this.unvote(votes[i].author, votes[i].permlink)}>{button}</button>,
            })
        }


        return rows;

    }

    compareDates = (a, b) => {
        return (moment(a, "DD/MM/YY HH:mm").unix() < moment(b, "DD/MM/YY HH:mm").unix()) ? -1 : 1;
    };

    render_votes = () => {

        const integratedSortingColumnExtensions = [
            { columnName: 'date', compare: this.compareDates },
        ];

        let columns = [
            { name: "date", title: "date (d/m/y)" },
            { name: "author", title: "author" },
            { name: "permlink", title: "permlink" },
            { name: "percentage", title: "percentage" },
            { name: "reason", title: "reason" },
            { name: "trailed", title: "voter" },
            { name: "unvote", title: " " },
        ];

        return (
            <Grid rows={this.renderRows()} columns={columns}>
                <SearchState />
                <IntegratedFiltering />
                <PagingState
                    defaultCurrentPage={0}
                    pageSize={15}
                />
                <SortingState
                    defaultSorting={[{ columnName: 'date', direction: 'desc' }]}
                />
                <IntegratedSorting columnExtensions={integratedSortingColumnExtensions} />
                <IntegratedPaging />

                <Table />
                <Toolbar />
                <SearchPanel />
                <TableHeaderRow showSortingControls />
                <PagingPanel />


            </Grid>
        )
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
                    <a className="navbar-brand" href="#">Downvote Control Tool</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="navbarsExampleDefault">
                        <ul className="navbar-nav mr-auto">
                            <a href={"#"} onClick={this.logout}>logout</a>
                        </ul>

                    </div>
                </nav>

                <main role="main" className="container">
                    <h3> Logged in as :  {this.props.logged_user.username}</h3>
                    <p> Current voting power is : {this.props.logged_user.voting_power} % <br />
                        Current downvoting power is : {this.props.logged_user.downvoting_power} %</p>
                    <br />

                    <h4>Global settings : </h4>

                    <form onSubmit={(e) => this.save_settings(e)}>
                        <p>Only use automatic downvote votes when power is above :
                            <input type={"number"} style={{ width: "60px" }} max={100} min={0} value={this.props.logged_user.dv_threshold} onChange={(e) => this.props.setDvThreshold(e.target.value)} /> %

                        </p>
                        <p>If my downvoting power reaches 0, use my voting power to downvote when my power is above :
                            <input type={"number"} style={{ width: "60px" }} max={100} min={0} value={this.props.logged_user.vp_threshold} onChange={(e) => this.props.setVpThreshold(e.target.value)} /> %
                            <br /><small>This setting also applies when upvoting to counter downvotes</small>
                        </p>

                        <p>Only downvote if the post has more than  :

                            <input type={"number"} style={{ width: "60px" }} min={0} value={this.props.logged_user.min_payout} onChange={(e) => this.props.setMinPayout(e.target.value)} />
                            $ of pending payouts.
                            <br /><small>Posts with 0$ payout won't be downvoted</small>
                        </p>
                        <p><input type={"checkbox"} checked={this.props.logged_user.revote === true} onChange={this.props.setRevote} />   Re-vote if there is the opportunity to increase the upvote or downvote.
                            <br />This is useful to counter people that will do a small upvote to bait auto downvotes and then revote with a higher percentage.

                            <button style={{ float: "right" }} onClick={(e) => this.save_settings(e)} className={"btn btn-primary"}>Save settings</button>
                        </p>
                    </form>
                    <hr />
                    <Tabs defaultActiveKey="trail" id="modal-tab" transition={false} >

                        <Tab eventKey="trail" title="Trail" >
                            <h5> Follow downvote trail </h5>
                            <p> Allows you to trail the downvotes of a specific account and thus downvote any content they downvote at a given rate relative to the size of their downvote.</p>
                            <p>Example: If you choose to trail <b>@abuse.control</b> with rating 0.75, then if  <b>@abuse.control</b> gives a <b>50%</b> downvote to a post you will give the same post a <b>37.5%</b> downvote.</p>

                            <form onSubmit={(e) => this.add_trail(e, 1)}>
                                <input type={"text"} placeholder={"username"} value={this.state.trail_username} onChange={(e) => this.setState({ trail_username: e.target.value })} />
                                <input type={"number"} min={0.01} max={2.5} step={0.01} style={{ width: "60px" }} value={this.state.trail_ratio} onChange={(e) => this.setState({ trail_ratio: e.target.value })} />
                                <button className={"btn  btn-primary"} onClick={(e) => this.add_trail(e, 1)}>Add</button>
                            </form>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Username</th>
                                        <th scope="col">Ratio</th>
                                        <th scope="col">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.render_positive_trails()}

                                </tbody>
                            </table>

                        </Tab>

                        <Tab eventKey="counter_upvotes" title="Counter upvotes " >
                            <h5> Counter upvotes </h5>
                            <p> Used to counteract upvotes from specified accounts, meaning that you will downvote anything that they choose to upvote at a given rate relative to their upvote. </p>
                            <p>Example: If you choose to counter upvote <b>@baduser</b>r with rating 1.2, then if <b>@baduser</b> gives a 50% upvote to something, you will add a <b>60%</b> downvote to the same post or comment, while a rating of 0.5 would make you downvote <b>25%</b>, etc.
                                <br />
                                <br />
                                Note that if your settings would make you use more voting power than necessary downvotecontrol will adapt dynamically the vote percentage when voting, so that you counter the upvote fully.
                            </p>
                            <form onSubmit={(e) => this.add_trail(e, -1)}>
                                <input type={"text"} placeholder={"username"} value={this.state.trail_username} onChange={(e) => this.setState({ trail_username: e.target.value })} />
                                <input type={"number"} min={0} max={2.5} step={0.1} style={{ width: "60px" }} value={this.state.trail_ratio} onChange={(e) => this.setState({ trail_ratio: e.target.value })} />
                                <button className={"btn btn-primary"} onClick={(e) => this.add_trail(e, -1)} >Add</button>
                            </form>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Username</th>
                                        <th scope="col">Ratio</th>
                                        <th scope="col">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.render_negative_trails()}

                                </tbody>
                            </table>
                        </Tab>
                        <Tab eventKey="counter_downvotes" title="Counter downvotes " >
                            <h5> Counter downvotes </h5>
                            <p> Used to counteract downvotes from specified accounts, meaning that you will upvote anything that they choose to downvote at a given rate relative to their downvote. </p>
                            <p>Example: If you choose to counter downvote <b>@baduser</b>r with rating 1.2, then if <b>@baduser</b> gives a 50% downvote on something, you will do a <b>60%</b> upvote to the same post or comment, while a rating of 0.5 would make you upvote at <b>25%</b>, etc.
                                <br />
                                <br />
                                Note that if your settings would make you use more voting power than necessary downvotecontrol will adapt dynamically the vote percentage when voting, so that you counter the downvote fully.
                            </p>

                            <form onSubmit={(e) => this.add_trail(e, 2)}>
                                <input type={"text"} placeholder={"username"} value={this.state.trail_username} onChange={(e) => this.setState({ trail_username: e.target.value })} />
                                <input type={"number"} min={0} max={2.5} step={0.1} style={{ width: "60px" }} value={this.state.trail_ratio} onChange={(e) => this.setState({ trail_ratio: e.target.value })} />
                                <button className={"btn btn-primary"} onClick={(e) => this.add_trail(e, 2)} >Add</button>
                            </form>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Username</th>
                                        <th scope="col">Ratio</th>
                                        <th scope="col">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.render_counter_downvote_trail()}

                                </tbody>
                            </table>
                        </Tab>
                        <Tab eventKey="counter_dv_blacklist" title="Counter downvotes blacklist" >
                            <h5> Counter downvotes blacklist </h5>
                            <p>Counter downvotes author blacklist, you won't counter the downvotes if the reciever of the vote is in this list. Separate each user by a comma <br /></p>
                            <form onSubmit={this.add_counter_dv_blacklist}>
                                <input type={"text"} placeholder={"username"} value={this.state.trail_username} onChange={(e) => this.setState({ trail_username: e.target.value })} />
                                <button className={"btn btn-primary"} onClick={this.add_counter_dv_blacklist} >Add</button>
                            </form>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Username</th>
                                        <th scope="col">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.render_counter_downvote_blacklist()}

                                </tbody>
                            </table>
                        </Tab>
                        <Tab eventKey="whitelist" title="Whitelist" >
                            <h5> Whitelist </h5>
                            <p>You won't downvote the users in this list</p>
                            <form onSubmit={this.add_whitelist}>
                                <input type={"text"} placeholder={"username"} value={this.state.trail_username} onChange={(e) => this.setState({ trail_username: e.target.value })} />
                                <button className={"btn btn-primary"} onClick={this.add_whitelist} >Add</button>
                            </form>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Username</th>
                                        <th scope="col">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.render_whitelist()}

                                </tbody>
                            </table>
                        </Tab>
                        <Tab eventKey="hitlist" title="Hit list" >
                            <h5> Hist list </h5>
                            <p>Downvote user using x% whenever his post or comment reaches more than y$ (the number of dollar is the one in the global settings) </p>
                            <p>For instance you can configure the tool to downvote user @milkinguser whenever he makes more than 5$ on a post or comment with a 30% downvote</p>
                            Downvote
                            <form onSubmit={() => this.add_hitlist}>
                                <input type={"text"} placeholder={"username"} value={this.state.trail_username} onChange={(e) => this.setState({ trail_username: e.target.value })} />
                                With a
                                <input type={"number"} style={{ width: "60px" }} min={0.1} max={100} value={this.state.hitlist_percent} onChange={(e) => this.setState({ hitlist_percent: e.target.value })} />
                                % downvote if his post has a payout superior to
                                <input type={"number"} style={{ width: "60px" }} value={this.state.hitlist_min_payout} onChange={(e) => this.setState({ hitlist_min_payout: e.target.value })} /> $

                                <button className={"btn btn-primary"} style={{ marginLeft: "5px" }} onClick={this.add_hitlist} >Add</button>
                            </form>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Username</th>
                                        <th scope="col">downvote percent</th>
                                        <th scope="col">Minimum payout</th>
                                        <th scope="col">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.render_hitlist()}
                                </tbody>
                            </table>
                        </Tab>
                        <Tab eventKey="vote_history" title="Vote history" >
                            <h5>Vote history </h5>
                            <p>Here's the history of all the votes you made though this tool</p>
                            {this.render_votes()}
                        </Tab>
                    </Tabs>
                </main>
            </div>
        )

    }

}


const mapStateToProps = (state) => {
    return {
        logged_user: state.user,
        data: state.data,
    };
};

export default connect(mapStateToProps, { login, unvote, removeCounterDvBlacklist, logout, fetchLogin, fetchWhitelist, addToCounterDvBlacklist, fetchExecutedVotes, saveSettings, setRevote, fetchTrails, addToTrail, addToHitlist, removeHitlist, removeTrail, setDvThreshold, setVpThreshold, setMinPayout, addToWhitelist, removeWhitelist, fetchHitlist })(Settings);//fetchCounterDvBlacklist