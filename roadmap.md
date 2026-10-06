# Pugclicks roadmap

## Done this session
- [x] Admin page hidden (shows "Page not found" to non-admins), robots Disallow: /admin, noindex/nofollow/noarchive
- [x] Homepage lists every published article grouped by category
- [x] Thumbnails auto-fit, fully visible (object-contain + blurred fill)

## In progress (this turn)
- [ ] Homepage redesign: breaking strip, hero + 2 secondary, latest feed, trending, category blocks (1 large + 3 small), editor's picks, newsletter, richer footer
- [ ] Live "X hours ago" timestamps (timeAgo helper, updated badge)
- [ ] RSS feed at /rss.xml
- [ ] Multiple categories per article (movies & series etc.)
- [ ] New categories: comics, netflix, f1
- [ ] Trending from real page views (article_views table + tracker)

## Next (after this turn, in order)
- [ ] Scheduled publishing (scheduled_at + auto-publish)
- [ ] Autosave drafts in admin editor
- [ ] Article revision history + restore
- [ ] Editor's picks flag in admin (featured toggle)
- [ ] Per-article index/noindex control
- [ ] Content expiration/archive
- [ ] Admin notification center (errors, failed publishing)
- [ ] Related articles engine improvements
- [ ] Internal search filters (category, date)
- [ ] Custom 404/500 pages polish
- [ ] Maintenance mode toggle

## Later (needs more design/decisions)
- [ ] Author profiles (real names/bios needed from user — no invented info)
- [ ] Source database with reusable source profiles
- [ ] Fact-check status + AI-content/editorial review status
- [ ] Content approval workflow
- [ ] Breaking-news/live-update mode
- [ ] Redirect manager
- [ ] Broken-link scanner
- [ ] Admin activity/audit log + login/security log
- [ ] Database backup/restore controls
- [ ] Media usage tracker + image copyright/license/source tracker
- [ ] Content performance dashboard (views, engagement, CTR, search traffic)
- [ ] Duplicate-content detector
- [ ] Webhook/event system for auto-publishing
- [ ] System health/status page
