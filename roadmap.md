# Pugclicks roadmap

## Done this session
- [x] Admin page hidden (shows "Page not found" to non-admins), robots Disallow: /admin, noindex/nofollow/noarchive
- [x] Homepage lists every published article grouped by category
- [x] Thumbnails: card images fill their frames (object-cover); full article page shows the whole photo (object-contain)
- [x] Homepage redesign: breaking strip, hero + 2 secondary, latest feed, trending, category blocks, editor's picks, newsletter, richer footer
- [x] Live "X hours ago" timestamps (timeAgo helper, updated badge)
- [x] RSS feed at /rss.xml
- [x] Multiple categories per article (movies & series etc.)
- [x] New categories: comics, netflix, f1
- [x] Trending from real page views (article_views table + tracker)
- [x] Newsletter signup storage + admin subscriber list (/admin/subscribers, search + remove)
- [x] AI security advisor (/admin/security): admin describes suspicious activity, AI analyzes and recommends protection steps, reports saved
- [x] Mobile audit: no horizontal overflow on home/article, menu, forms, admin tabs verified at phone size
- [x] Mobile feed fix: compact Latest rows (thumbnail + clear title + time, ~2-3 cards per screen), card images fill their frames (object-cover), trending 2-col on phones
- [x] Theme customizer (/admin/design): accent color, font style, corner style — saved to site_content, applied site-wide including dark mode, with live preview
- [x] Traffic dashboard (/admin/traffic): visits today/7d/30d, visits-per-day chart, most viewed articles, top pages, referrers (site_visits table + per-session tracker, no personal data)

## Next (in order)
- [ ] Newsletter confirmation emails + opt-out (BLOCKED: needs the owner's verified sending domain — user must complete email domain setup first; then: confirmation-link flow, double opt-in, Lovable unsubscribe webhook removes unsubscribed recipients from the list)
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
- [ ] SaaS (paid plans / members area) — awaiting user decision on scope
