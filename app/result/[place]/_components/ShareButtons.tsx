import { FaLine, FaXTwitter } from "react-icons/fa6";

interface Props {
  shareUrl: string;
  text: string;
}

export const ShareButtons = ({ shareUrl, text }: Props) => {
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  const line = `https://line.me/R/msg/text/?${encodeURIComponent(`${text}\n${shareUrl}`)}`;

  return (
    <section
      aria-label="この結果をシェア"
      className="flex flex-col items-center gap-3"
    >
      <p className="text-base-content/60 text-sm">この結果をシェア</p>
      <div className="flex gap-3">
        <a
          href={line}
          target="_blank"
          rel="noopener noreferrer"
          className="btn gap-2 border-none text-white"
          style={{ backgroundColor: "#06C755" }}
        >
          <FaLine className="text-lg" />
          LINE
        </a>
        <a
          href={x}
          target="_blank"
          rel="noopener noreferrer"
          className="btn gap-2 border-none bg-black text-white hover:bg-neutral-800"
        >
          <FaXTwitter className="text-lg" />
          ポスト
        </a>
      </div>
    </section>
  );
};
