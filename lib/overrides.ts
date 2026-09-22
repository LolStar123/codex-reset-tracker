import corrections from '@/data/overrides.json';
import type {Category,Post} from './types';
import {inferResetType} from './classify';
export function applyCorrections(posts:Post[]) {
    const overrides=corrections as Record<string,{category?:Category|'hidden';resetType?:Post['resetType'];eventBasis?:Post['eventBasis'];scope?:string;reason:string}>;
    return posts.flatMap(post=>{
        const normalized=post.provenance==='history'&&/banked|reset bank|reset into (?:your|the) bank/i.test(post.text)?{...post,resetType:inferResetType(post.text)}:post;
        const o=overrides[post.id];if(!o)return [normalized];
        if(o.category==='hidden')return [];
        const {reason,category,...changes}=o;void reason;
        return [{...normalized,...changes,category:category??normalized.category}];
    });
}
