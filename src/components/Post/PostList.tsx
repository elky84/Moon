import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Card = styled.div`
  background-color: #1f1f1f;
  color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 20px;
  margin-bottom: 20px;
  padding: 20px;
  display: block;
  text-decoration: none;
`;

const CardContent = styled.div`
  padding: 15px;
`;

const Title = styled(Link)`
  font-size: 24px;
  color: #4d7bf3;
  text-decoration: none;

  &:hover {
    color: #82a4f8;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: #e0e0e0;
  color: #333;
  padding: 0.2em 0.4em;
  margin: 0.2em;
  border-radius: 0.2em;
  font-size: 0.8em;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: #ccc;
  }

  &.selected {
    background-color: #4d7bf3;
    color: white;
  }
`;

const SearchInput = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

interface PostData {
  title: string;
  summary: string;
  tags: string[];
  slug: string;
  date: string; // Assuming date is in 'YYYY-MM-DD' format
}

interface PostListProps {
  type: 'tag' | 'year';
}

const PostList: React.FC<PostListProps> = ({ type }) => {
  const [postsData, setPostsData] = useState<PostData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); // 검색어 상태 추가

  const allTags = Array.from(new Set(postsData.flatMap(post => post.tags)));

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/postsData.json')
      .then(response => response.json())
      .then(data => setPostsData(data))
      .catch(error => console.error('Error fetching posts data:', error));
  }, []);

  useEffect(() => {
    const yearsSet = new Set(postsData.map(post => post.date.slice(0, 4)));
    setSelectedYears(Array.from(yearsSet));
    setYears(Array.from(yearsSet));
  }, [postsData]);

  const handleClick = (slug: string) => {
    fetch(`/posts/${slug}.md`)
      .then(response => response.text())
      .then(markdown => {
        console.log(markdown);
      })
      .catch(error => console.error('Error fetching markdown file:', error));
  };

  const handleTagClick = (tag: string) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    updateQueryParams();
  };

  const handleYearToggle = (year: string) => {
    const updatedYears = selectedYears.includes(year)
      ? selectedYears.filter(y => y !== year)
      : [...selectedYears, year];
    setSelectedYears(updatedYears);
    updateQueryParams();
  };

  const updateQueryParams = () => {
    const queryParams = new URLSearchParams();
    selectedTags.forEach(t => queryParams.append('tags', t));
    selectedYears.forEach(y => queryParams.append('years', y));
    const queryString = queryParams.toString();
    window.history.replaceState({}, '', queryString ? `?${queryString}` : window.location.pathname);
  };

  const filteredPosts = postsData.filter(post => {
    const title = post.title || ''; // title이 undefined일 경우 빈 문자열로 대체
    const summary = post.summary || ''; // summary가 undefined일 경우 빈 문자열로 대체
  
    const matchesTag = type === 'tag' ? selectedTags.every(tag => post.tags.includes(tag)) : true;
    const matchesYear = type === 'year' ? selectedYears.includes(post.date.slice(0, 4)) : true;
  
    // 검색어를 '|'로 나눈 후 각각을 조건으로 검사
    const searchTerms = searchQuery.split('|').map(term => term.trim().toLowerCase());
    const matchesSearch = searchTerms.every(term => 
      title.toString().toLowerCase().includes(term) || summary.toString().toLowerCase().includes(term)
    );
  
    return matchesTag && matchesYear && matchesSearch;
  });
  

  return (
    <>
      <SearchInput
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)} // 검색 상태 업데이트
      />
      <div>
        {type === 'year' &&
          years.map(year => (
            <button
              key={year}
              onClick={() => handleYearToggle(year)}
              style={{
                backgroundColor: selectedYears.includes(year) ? '#4d7bf3' : '#e0e0e0',
                color: selectedYears.includes(year) ? 'white' : '#333',
                padding: '5px 10px',
                margin: '5px',
                borderRadius: '5px',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              {year}
            </button>
          ))}
        {type === 'tag' &&
          allTags.map(tag => (
            <Tag
              key={tag}
              className={selectedTags.includes(tag) ? 'selected' : ''}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Tag>
          ))}
      </div>
      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <Card key={post.slug}>
            <CardContent>
              <Title to={`/posts/${encodeURIComponent(post.slug)}`} onClick={() => handleClick(post.slug)}>
                {post.title} - {post.date}
              </Title>
              <p>{post.summary}</p>
              <TagsContainer>
                {post.tags.map(tag => (
                  <Tag
                    key={tag}
                    className={type === 'tag' && selectedTags.includes(tag) ? 'selected' : ''}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </TagsContainer>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No posts match the selected {type === 'tag' ? 'tags' : 'years'}.</p>
      )}
    </>
  );
};

export default PostList;
