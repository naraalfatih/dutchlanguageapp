import { getCultureArticle, getScenario } from '@praat/content';
import { Link, useParams } from 'react-router';
import { AudioButton } from '../components/AudioButton';
import { Empty, Header, Nl } from '../components/ui';

export default function CultureArticle() {
  const { articleId = '' } = useParams();
  const article = getCultureArticle(articleId);
  if (!article) {
    return (
      <>
        <Header title="Not found" back="/culture" />
        <Empty title="This article doesn't exist." />
      </>
    );
  }
  const scenario = article.tryScenarioId ? getScenario(article.tryScenarioId) : undefined;
  return (
    <article className="stack-lg">
      <Header title={article.title} subtitle={`${article.minutes} min read`} back="/culture" />
      <p className="big-nl" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
        {article.summary}
      </p>
      {article.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{s.body}</p>
        </section>
      ))}
      <section className="card stack">
        <div className="section-title">Key phrases</div>
        {article.keyPhrases.map((p) => (
          <div key={p.nl} className="row">
            <AudioButton text={p.nl} id={`culture-${p.nl}`} />
            <div>
              <Nl>{p.nl}</Nl>
              <div className="small muted">{p.en}</div>
            </div>
          </div>
        ))}
      </section>
      {scenario && (
        <Link to={`/talk/scenario/${scenario.id}`} className="btn primary block">
          Try it: {scenario.title}
        </Link>
      )}
    </article>
  );
}
