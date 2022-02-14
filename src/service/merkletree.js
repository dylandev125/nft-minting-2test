/**
 * This is the function for the backend:
 *
 * You receive the address at the endpoint
 *
 */
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256';
import WAValidator from 'wallet-address-validator';

const verifyWhitelist = async (address) => {
    // Wallet Validate
    let rawdata;
    const valid = WAValidator.validate(address, 'ETH');
    if(!valid) {
        console.log('Address INVALID');
        return false;
    }
    // console.log('address: ', address);
    // console.log('This is a valid address');

    await fetch(`./whitelist/whitelist_0.json`)
      .then((response) => response.text())
      .then((data) => {
        rawdata = data;
      })

    let whiteListArray = JSON.parse(rawdata) || [];

    const leaves = whiteListArray.map(v => keccak256(v));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = keccak256(address);
    const proof = tree.getHexProof(leaf);
    const verified = tree.verify(proof, leaf, root);

    // console.log('leaf: ', leaf);
    // console.log('proof: ', proof);
    // console.log('verified: ', verified);
    return {root, proof, leaf, verified};
}

export default verifyWhitelist;