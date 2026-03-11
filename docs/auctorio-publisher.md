# Tecnoria Auctorio Publisher Contract

## Summary

Tecnoria accepts editorial publishing requests from Auctorio through `/api/v1/blog`.

## Authentication

- Header: `Authorization: Bearer <AUCTORIO_PUBLISHER_TOKEN>`
- Fallback: admin/editor cookie sessions still work for the internal panel

## Supported operations

- `POST /api/v1/blog`
- `PUT /api/v1/blog/:id`
- `POST /api/v1/blog/upload-image`
- `DELETE /api/v1/blog/:id`

The effective editorial workflow is:

- `draft`: stored but not public
- `publish`: visible on the public blog
- `unpublish`: performed as `PUT` with `status=draft`

## Payload fields

- `slug`
- `title`
- `shortDescription`
- `content`
- `image`
- `tags`
- `author`
- `status`
- `publishedAt`
- `seoTitle`
- `seoDescription`

## Public visibility rules

- Public list/detail endpoints return only `status='publish'`
- Admin or Auctorio requests may query `?status=all|draft|publish`

## Validation

Validated on March 11, 2026:

- `POST /api/v1/blog` with the Auctorio bearer token returns `201`
- Draft entries are not visible through the public unauthenticated post route
- `DELETE /api/v1/blog/:id` with the same token returns `204`
