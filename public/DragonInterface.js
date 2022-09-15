//const { burnToken } = require("@metaplex/js/lib/actions");

window.dragon = {
  /// after unity instace loaded, this method will be called by unity object(dragonEventHandler)
  initialize: function () {
    var root = document.getElementById('root');
    root.style.display = 'none';
  },
  //after wallet connect send userdate to the unity part.
  walletConnect: function (address) {
    window.dragon.walletAddress = address.toString();
    if (unityInstance != undefined) {
      unityInstance.SendMessage('KeyChainWeb3', 'UserConnected', address.toString());
    }
  },
  // walletSign: async function () {
  //   if (unityInstance != undefined) {
  //     await window.dragon.getSignMessage()
  //     unityInstance.SendMessage('CharacterCreation', 'GetSignedMsg', window.dragon.signedMsg);
  //   }
  // },
  checkWalletConnect: function () {
    if (window.dragon.walletAddress != undefined)
      unityInstance.SendMessage('KeyChainWeb3', 'UserConnected', window.dragon.walletAddress);
  }
  // data = true or false
  // if data is true, show connect wallet burnToken and false not show.
}