import { SITE_COMPANY, SITE_NAME } from "../../../constants/site";

export const PageComponent = () => (
  <article className="prose prose-sm mx-auto max-w-3xl">
    <h1>プライバシーポリシー</h1>

    <p>
      {SITE_COMPANY}（以下「運営者」といいます）は、運営する{SITE_NAME}
      （以下「本サービス」といいます）における個人情報等の取扱いについて、以下のとおり定めます。
    </p>

    <h2>1. 収集する情報</h2>
    <p>
      本サービスは、利用にあたりアカウント登録を必要とせず、氏名・メールアドレス等の個人情報を利用者から直接取得することはありません。一方で、後述のアクセス解析ツールおよび広告配信サービスを通じて、利用状況に関する情報（閲覧ページ・端末やブラウザの種別・おおよその地域等）を
      Cookie を用いて収集する場合があります。また、後述のとおり利用者の入力内容を、利用者のブラウザの
      localStorage（端末内の保存領域）に保存します。
    </p>

    <h2>2. アクセス解析ツールの利用</h2>
    <p>
      本サービスは、サービス改善のため、Google LLC が提供するアクセス解析ツール「Google
      Analytics」を利用する場合があります。Google Analytics は Cookie
      を利用して利用者の情報を収集します。これにより収集される情報は、Google
      社のプライバシーポリシーに基づいて管理されます。利用者は、ブラウザの設定で
      Cookie を無効化することにより、収集を拒否することができます。
    </p>
    <ul>
      <li>
        Google のプライバシーポリシー:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://policies.google.com/privacy
        </a>
      </li>
    </ul>

    <h2>3. 広告配信について（Google AdSense）</h2>
    <p>
      本サービスは、第三者配信の広告サービス「Google
      AdSense」を利用します。Google
      をはじめとする第三者配信事業者は、Cookie
      を使用して、利用者の過去の本サービスや他のウェブサイトへのアクセス情報に基づいて広告を配信します。Google
      が広告 Cookie を使用することにより、Google
      や Google
      のパートナーは、本サービスや他のサイトへの過去のアクセス情報に基づいて広告を表示できます。
    </p>
    <ul>
      <li>
        利用者は、Google
        の広告設定でパーソナライズ広告を無効にできます:{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.google.com/settings/ads
        </a>
      </li>
      <li>
        Google
        以外の第三者配信事業者による Cookie の使用は、次のページから無効にできます:{" "}
        <a
          href="https://www.aboutads.info"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.aboutads.info
        </a>
      </li>
      <li>
        広告に関する Google のポリシー:{" "}
        <a
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://policies.google.com/technologies/ads
        </a>
      </li>
    </ul>

    <h2>4. アフィリエイトプログラムについて（A8.net）</h2>
    <p>
      本サービスは、株式会社ファンコミュニケーションズが運営するアフィリエイトプログラム「A8.net」を利用しています。利用者が本サービス内の広告（バナー等）を表示・クリックした場合等に、広告表示回数や成果の計測のため、A8.net
      および広告主により Cookie
      が利用されることがあります。これにより取得される情報から、運営者が利用者個人を特定することはありません。
    </p>

    <h2>5. 外部送信について</h2>
    <p>
      本サービスは、アクセス解析・広告配信および機能提供のため、利用者の情報の一部を以下の外部事業者へ送信します。
    </p>
    <ul>
      <li>Google LLC（アクセス解析「Google Analytics」。Cookie・閲覧情報等）</li>
      <li>Google LLC（広告配信「Google AdSense」。Cookie・閲覧情報等）</li>
      <li>
        株式会社ファンコミュニケーションズ（アフィリエイト「A8.net」。Cookie・閲覧情報等）
      </li>
      <li>OpenStreetMap Foundation（Nominatim。地名から座標への変換）</li>
      <li>Open-Meteo（緯度・経度に基づく紫外線・気象データの取得）</li>
    </ul>

    <h2>6. アクセスログ</h2>
    <p>
      本サービスを稼働させるホスティング事業者において、システムの運用・保守・セキュリティ確保のため、IP
      アドレス・アクセス日時・ブラウザ情報等が自動的に記録される場合があります。運営者がこれらを用いて個人を特定することはありません。
    </p>

    <h2>7. 入力情報および端末内保存（localStorage）の取扱い</h2>
    <p>
      利用者が入力した地名・肌タイプ・SPF値等は、判定結果を表示するための処理にのみ使用し、運営者のサーバー側で個人を特定できる形で保存することはありません。
    </p>
    <p>
      加えて本サービスは、次回以降の再入力の手間を省くため、利用者が入力した地名・肌タイプ・SPF値を、利用者のブラウザの
      localStorage（端末内の保存領域）に保存します。これらの情報は利用者の端末内にのみ保存され、運営者や第三者のサーバーへ送信・保存されることはありません。利用者は、ブラウザの設定から
      localStorage を含む閲覧データを削除することで、いつでもこれらの保存情報を消去できます。
    </p>

    <h2>8. 第三者提供</h2>
    <p>
      本サービスは、取得した情報を、法令に基づく場合を除き、前記の外部事業者以外の第三者に提供することはありません。
    </p>

    <h2>9. ポリシーの変更</h2>
    <p>
      本ポリシーの内容は、必要に応じて変更することがあります。変更後の内容は、本ページに掲載した時点で効力を生じるものとします。
    </p>

    <p>
      制定日: 2026年7月6日
      <br />
      最終改定日: 2026年7月15日
    </p>
  </article>
);
