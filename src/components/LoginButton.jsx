import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useEffect } from "react";

function LoginButton({ onConnected }) {
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      onConnected(publicKey.toString());
    }
  }, [connected, publicKey, onConnected]);

  return (
    <div className="flex flex-col items-center gap-4">
      <WalletMultiButton />
      {connected && publicKey && (
        <p className="text-gray-400 text-sm">
          Connected: {publicKey.toString().slice(0, 4)}...
          {publicKey.toString().slice(-4)}
        </p>
      )}
    </div>
  );
}

export default LoginButton;
