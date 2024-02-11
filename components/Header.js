import { useRouter } from 'next/router';
import { ConnectButton } from 'web3uikit';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();

  // Перевірка поточного шляху та встановлення посилання і тексту
  let linkHref, linkText;
  if (router.pathname === '/stake') {
    linkHref = '/';
    linkText = 'Raffle';
  } else {
    linkHref = '/stake';
    linkText = 'Stake';
  }

  return (
    <div className="p-5 header">
      <div className="flex flex-row items-center">
        <Link href={linkHref} className="explore">{linkText}
        </Link>
      </div>
      <Link href="/">
        <img className="header-logo" src="/img/flipflop_logo.png" alt="Logo" />
      </Link>
      <ConnectButton moralisAuth={false} />
    </div>
  );
}
