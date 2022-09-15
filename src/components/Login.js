import React from "react";
import { login, login_keychain } from "../actions/actions"
import { connect } from "react-redux";
import backend from "../api/backend";
const dhive = require('@hivechain/dhive');

class LoginParking extends React.Component {

    state = { username: "", error: "", loginType: "", showBnt: true };
    client = new dhive.Client('https://anyx.io');

    login_hivesigner = () => {
        window.open(process.env.NODE_ENV === "production" ? 'https://back.downvotecontrol.com/auth' : "http://localhost:4002/auth", '', ' scrollbars=yes,menubar=no,width=447,height=614, resizable=yes,toolbar=no,location=no,status=no')
    };

    display_login_keychain = () => {

        console.log('props.logged_user', this.props.logged_user)

        if (window.hive_keychain) {

            let keychain = window.hive_keychain

            keychain.requestHandshake(() => {
                this.setState({ loginType: "keychain" });
            });

        } else {
            this.setState({ error: "You do not have hive keychain installed" });
        }
    };

    // window.dragon.ShowConnectBtn = function (data) {
    //     this.setState({ showBnt: data })
    // }

    send_login_token = async () => {

        let keychain = window.hive_keychain;
        let memo = (await backend.post('/auth/keychain/fetch_memo', { username: this.state.username })).data;

        console.log('memo', memo);

        if (memo.status === "ok") {
            keychain.requestVerifyKey(this.state.username, memo.message, "Posting", (response) => {
                if (response.success === true) {
                    // this.props.login_keychain(this.state.username, response.result);
                    console.log('log in successed: ', this.state.username)
                    window.dragon.walletConnect(this.state.username)
                }
            });
        } else {
            this.setState({ error: "There was an error with the backend server, please try again" });
        }

    };

    login_keychain = async (event) => {
        event.preventDefault();


        if (window.hive_keychain) {
            let keychain = window.hive_keychain;

            let data = await this.client.database.getAccounts([this.state.username]);
            console.log('data in login_keychain', data);
            if (data.length === 1) {

                let auth = data[0].posting.account_auths.filter(el => el[0] === "downvote-tool");
                console.log('auth in login_keychain', auth);

                if (auth.length === 0) {

                    keychain.requestAddAccountAuthority(this.state.username, "downvote-tool", "posting", 1, (response) => {
                        console.log('requestAddAccountAuthority in login_keychain', response);

                        if (response.success === true)
                            this.send_login_token();
                        else
                            this.setState({ error: "Keychain error" });
                    });
                } else {
                    this.send_login_token();
                }
            } else {
                this.setState({ error: "Hive user not found" });
            }
        } else {
            this.setState({ error: "You do not have hive keychain installed" });
        }
    };

    render() {

        return (
            <>
                {this.state.showBnt &&
                    <div className="wrapper fadeInDown">
                        <div id="formContent">

                            <div className="fadeIn first">
                                <img src="./hive_symbol.png" alt="hive icon" style={{ width: "150px" }} />
                            </div>

                            <br />
                            <span style={{ color: "red" }}>{this.state.error}</span>

                            <form onSubmit={this.login_keychain}>
                                <input type={"text"} placeholder={"Username"} value={this.state.username} onChange={(event) => this.setState({ username: event.target.value })} />

                                <button type={"button"} className="btn btn-primary " onClick={this.login_keychain} style={{
                                    backgroundColor: "white",
                                    color: "#999999",
                                    width: "235px",
                                    marginTop: "20px",
                                    border: "1px solid #999999",
                                    borderRadius: "0"
                                }}>Log in with keychain
                                </button>
                            </form>
                        </div>
                    </div>
                }
            </>
        )
    }

}


const mapStateToProps = (state) => {
    return {
        logged_user: state.user
    };
};

export default connect(mapStateToProps, { login, login_keychain })(LoginParking);