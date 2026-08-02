import { AppError } from "../utils/AppError";
import type { IProfileGitHub, IProfileGitHubRepository } from "../models/Profile";

interface GitHubUserResponse {
  login: string;
  html_url: string;
  avatar_url: string;
  followers: number;
  public_repos: number;
}
interface GitHubRepositoryResponse {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  languages_url: string;
}

async function githubRequest<T>(url: string, username: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/vnd.github+json", "User-Agent": "DevHub" }, signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new AppError("GitHub is currently unavailable. Please try again later.", 502, "GITHUB_UNAVAILABLE");
  }
  if (response.status === 404) throw new AppError(`GitHub user '${username}' was not found.`, 404, "GITHUB_USER_NOT_FOUND");
  if (!response.ok) throw new AppError("GitHub could not complete the sync. Please try again later.", 502, "GITHUB_SYNC_FAILED");
  return response.json() as Promise<T>;
}

export async function fetchGitHubSnapshot(username: string): Promise<IProfileGitHub> {
  const encodedUsername = encodeURIComponent(username);
  const user = await githubRequest<GitHubUserResponse>(`https://api.github.com/users/${encodedUsername}`, username);
  const repositories = await githubRequest<GitHubRepositoryResponse[]>(`https://api.github.com/users/${encodedUsername}/repos?per_page=100&sort=updated`, username);
  const nonForkRepositories = repositories.filter((repository) => !repository.fork);
  const showcaseRepositories: IProfileGitHubRepository[] = nonForkRepositories
    .slice(0, 6)
    .map((repository) => ({ name: repository.name, description: repository.description ?? undefined, url: repository.html_url, stars: repository.stargazers_count, language: repository.language ?? undefined }));
  const languageEntries = await Promise.all(nonForkRepositories.slice(0, 12).map((repository) => githubRequest<Record<string, number>>(repository.languages_url, username)));
  const languageTotals = new Map<string, number>();
  for (const languages of languageEntries) for (const [language, bytes] of Object.entries(languages)) languageTotals.set(language, (languageTotals.get(language) ?? 0) + bytes);
  return {
    username: user.login,
    profileUrl: user.html_url,
    avatarUrl: user.avatar_url,
    followersCount: user.followers,
    publicReposCount: user.public_repos,
    totalStars: nonForkRepositories.reduce((total, repository) => total + repository.stargazers_count, 0),
    topLanguages: [...languageTotals.entries()].sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, bytes]) => ({ name, bytes })),
    repositories: showcaseRepositories,
    syncedAt: new Date(),
  };
}
