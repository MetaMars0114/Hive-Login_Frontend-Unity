import React from "react";
import { login, login_keychain } from "../actions/actions"
import { connect } from "react-redux";
const dhive = require('@hivechain/dhive');
const encryptionHelper = require("./encryptionhelper");
const sanitize = require("xss");
const client = new dhive.Client('https://anyx.io');
const steem = require('steem');
require('dotenv').config();
const algorithm = "aes-128-cbc";
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

    send_login_token = async () => {

        let keychain = window.hive_keychain;
        // let memo = (await backend.post('/auth/keychain/fetch_memo', { username: this.state.username })).data;
        let memo_fetching= await getting_fetch_memo(this.state.username);
        // console.log('memo', memo);
        console.log("memo_fetching in send_login_token", memo_fetching);
        if (memo_fetching.status === "ok") {
            // keychain.requestVerifyKey(this.state.username, memo_fetching.message, "Posting", (response) => {
                keychain.requestSignBuffer(this.state.username, memo_fetching.message, "Posting", (response) => {
                if (response.success === true) {
                    // this.props.login_keychain(this.state.username, response.result);
                    console.log('log in successed::: ', this.state.username);
                    window.dragon.walletConnect(this.state.username);
                }
            },null,"SIGN WOO");
        } else {
            this.setState({ error: "There was an error while fetching_memo" });
        }

    };

    login_keychain = async (event) => {
        event.preventDefault();
        

        if (window.hive_keychain) {
            let keychain = window.hive_keychain;

            keychain.requestHandshake(() => {
                this.setState({ loginType: "keychain" });
            });

            let data = await this.client.database.getAccounts([this.state.username]);
            if (data.length === 1) {

                // let auth = data[0].posting.account_auths.filter(el => el[0] === "downvote-tool");
                // console.log('auth in login_keychain', auth);

                // if (auth.length === 0) {

                //     keychain.requestAddAccountAuthority(this.state.username, "downvote-tool", "posting", 1, (response) => {
                //         console.log('requestAddAccountAuthority in login_keychain', response);

                //         if (response.success === true)
                //             this.send_login_token();
                //         else
                //             this.setState({ error: "Keychain error" });
                //     });
                // } else {
                    this.send_login_token();
                // }
            } else {
                this.setState({ error: "Hive user not found" });
            }
        } else {
            this.setState({ error: "You do not have hive keychain installed" });
        }
    };
    login_with_username = async (event) => { 
        console.log("in login_with_username", this.state.username);
        window.dragon.walletConnect(this.state.username);
    };

    render() {

        return (
            <>
                {this.state.showBnt &&
                    <div className="wrapper fadeInDown" id="keychain-modal">
                        <div id="formContent">

                            <div className="fadeIn first">
                                <img src="./hive_symbol.png" alt="hive icon" style={{ width: "150px" }} />
                            </div>

                            <br />
                            <span style={{ color: "red" }}>{this.state.error}</span>

                            <form onSubmit={this.login_keychain}>
                                <input type={"text"} placeholder={"Username"} contentEditable="true" value={this.state.username} onChange={(event) => this.setState({ username: event.target.value })} />

                                <button type={"button"} className="btn btn-primary " onClick={this.login_keychain} style={{
                                    backgroundColor: "white",
                                    color: "#999999",
                                    width: "235px",
                                    marginTop: "20px",
                                    border: "1px solid #999999",
                                    borderRadius: "0"
                                }}>Sign in with keychain
                                </button>
                                <button type={"button"} className="btn btn-primary " onClick={this.login_with_username} style={{
                                    backgroundColor: "white",
                                    color: "#999999",
                                    width: "235px",
                                    marginTop: "20px",
                                    border: "1px solid #999999",
                                    borderRadius: "0"
                                }}>Log in with UserName
                                </button>
                                
                            </form>
                            
                        </div>
                    </div>
                }
            </>
        )
    }

}

async function getting_fetch_memo(usernameHive)  {
    const hive_username = sanitize(usernameHive);

    if (hive_username && hive_username.length < 16 && hive_username.length > 3) {
        let data = await client.database.getAccounts([hive_username]);

        console.log("data in getting fetch memo", data);
        
        let pub_key = data[0].posting.key_auths[0][0];

        if (data.length === 1) {
            let encoded_message = "";
                
            let { encrypted, iv } = await encrypt(hive_username);
            encrypted = "#" + encrypted;
            let wif = "5JRMuVZhkeE32Wfu1r62hr7jGdbmsXMPkgtC2Uid3pvhk9YSaQr";//have to insert in env
            encoded_message = steem.memo.encode(wif, pub_key, encrypted);
            console.log("encoded_message", encoded_message);
            return ({ status: "ok", message: encoded_message });
           

        } else {
            return({ status: "ko" });
        }
    }
};

function encrypt(text, initialisation_vector) {
    return new Promise(async resolve => {
        console.log("in resolve");
        let data;
        let iv;
        console.log("initialisation_vector",initialisation_vector)
        if (initialisation_vector) {
            data = await get_encryption_data(initialisation_vector);
            iv = initialisation_vector;
            console.log("data", data);
        }
        else {
            data = await get_encryption_data();
            console.log("data", data);
            let json_iv = JSON.stringify(data['iv']);
            json_iv = JSON.parse(json_iv);

            if (!json_iv.data)
                console.log(json_iv);

            iv = json_iv.data.toString();
        }

        // console.log("in encrypt:", algorithm);

        //const encText = encryptionHelper.encryptText(data.key, data.iv);
        console.log('before encrypt:', text, data.iv.toString())
        const encText = encryptionHelper.encryptText(algorithm, data.key, data.iv, text, "hex");
        let encrypted = "#" + encText;
        console.log('after encrypt:', encrypted)

        return resolve({ encrypted: encText, iv: iv });
    });
}

function get_encryption_data(iv) {
    console.log("get_encryption_data", get_encryption_data);
    return new Promise(async resolve => {
        let encryption_pw = "1234567890123456";
        let encryption_data = await encryptionHelper.getKeyAndIV(encryption_pw);//(process.env.ENCRYPTION_PW);//have to insert in env
        if (iv) {
            iv = iv.split(",").map(Number);
            const buf = Buffer.from(iv);
            const vue = new Uint8Array(buf);
            encryption_data['iv'] = vue;
            return resolve(encryption_data);
        }
        else
            return resolve(encryption_data);
    });
}


const mapStateToProps = (state) => {
    return {
        logged_user: state.user
    };
};

export default connect(mapStateToProps, { login, login_keychain })(LoginParking);