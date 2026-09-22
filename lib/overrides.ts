import corrections from '@/data/overrides.json';
import type {Category,Post} from './types';
export function applyCorrections(posts:Post[]) {
    const overrides=corrections as Record<string,{category:Category|'hidden';reason:string}>;
    return posts.flatMap(post=>{const o=overrides[post.id];if(!o)return [post];return o.category==='hidden'?[]:[{...post,category:o.category}];});
}
