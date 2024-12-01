const fs = require("fs");
const RSS = require("rss");

const generateRSS = () => {
  // RSS 피드 초기화
  const feed = new RSS({
    title: "Elky's Fan",
    description: "Fan 블로그",
    feed_url: "https://elky84.github.io/fan/rss.xml",
    site_url: "https://elky84.github.io/fan",
    language: "ko",
    pubDate: new Date(),
  });

  // postsData.json 읽기
  const postsData = JSON.parse(fs.readFileSync("./public/postsData.json", "utf-8"));

  // JSON 데이터로부터 RSS 아이템 추가
  postsData.forEach((post) => {
    feed.item({
      title: post.title,
      description: `${post.title} - 태그: ${post.tags.join(", ")}`,
      url: `https://elky84.github.io/fan/posts/${post.slug}`,
      date: post.date,
    });
  });

  // XML 파일로 저장
  const xml = feed.xml({ indent: true });
  fs.writeFileSync("./public/rss.xml", xml);
  console.log("RSS 피드 생성 완료: public/rss.xml");
};

generateRSS();
