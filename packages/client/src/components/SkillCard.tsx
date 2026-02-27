import { Link } from 'react-router-dom';
import { Star, Download } from 'lucide-react';

interface Props {
  skill: any;
}

export default function SkillCard({ skill }: Props) {
  return (
    <Link
      to={`/skills/${skill.name}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{skill.category_icon || '📦'}</span>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{skill.display_name}</h3>
            <p className="text-xs text-gray-500">by {skill.author_username}</p>
          </div>
        </div>
        {skill.official ? (
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Official</span>
        ) : null}
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{skill.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          {skill.avg_rating > 0 ? skill.avg_rating.toFixed(1) : '—'}
        </span>
        <span className="flex items-center gap-1">
          <Download className="w-3.5 h-3.5" />
          {skill.download_count}
        </span>
        {skill.category_label && (
          <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded">{skill.category_label}</span>
        )}
      </div>
    </Link>
  );
}
