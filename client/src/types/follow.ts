export interface FollowRelationship { followingId: string; isFollowing: boolean; followersCount: number }
export interface FollowUser { id: string; name: string; username: string }
export interface FollowPage { items: FollowUser[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } }
