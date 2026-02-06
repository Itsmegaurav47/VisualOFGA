export const EXAMPLES = {
  demo: `
model
  schema 1.1

type organization
  relations
    define member: [user] or owner
    define owner: [user]
    define repo_admin: [organization#member]

type repo
  relations
    define admin: (creator and repo_admin from owner) but not blocked
    define blocked: [user, user:*]
    define creator: [user]
    define owner: [organization]

type user
  `,
  github: `
model
  schema 1.1

type organization
  relations
    define member: [user] or owner
    define owner: [user]
    define repo_admin: [user, organization#member]
    define repo_reader: [user, organization#member]
    define repo_writer: [user, organization#member]

type repo
  relations
    define admin: [user, team#member] or repo_admin from owner
    define maintainer: [user, team#member] or admin
    define owner: [organization]
    define reader: [user, team#member] or triager or repo_reader from owner
    define triager: [user, team#member] or writer
    define writer: [user, team#member] or maintainer or repo_writer from owner

type team
  relations
    define member: [user, team#member]

type user
  `,

  gdrive: `
model
  schema 1.1

type doc
  relations
    define can_change_owner: owner
    define can_read: viewer or owner or viewer from parent
    define can_share: owner or owner from parent
    define can_write: owner or owner from parent
    define owner: [user]
    define parent: [folder]
    define viewer: [user, user:*, group#member]

type folder
  relations
    define can_create_file: owner
    define owner: [user]
    define parent: [folder]
    define viewer: [user, user:*, group#member] or owner or viewer from parent

type group
  relations
    define member: [user]

type user
  `,

  expenses: `
model
  schema 1.1

type employee
  relations
    define can_manage: manager or can_manage from manager
    define manager: [employee]

type report
  relations
    define approver: can_manage from submitter
    define submitter: [employee]
  `,

  iot: `
model
  schema 1.1

type device
  relations
    define can_rename_device: it_admin
    define can_view_live_video: it_admin or security_guard
    define can_view_recorded_video: it_admin or security_guard
    define it_admin: [user, device_group#it_admin]
    define security_guard: [user, device_group#security_guard]

type device_group
  relations
    define it_admin: [user]
    define security_guard: [user]

type user
  `,

  slack: `
model
  schema 1.1

type channel
  relations
    define commenter: [user, workspace#member] or writer
    define parent_workspace: [workspace]
    define writer: [user, workspace#member]

type user

type workspace
  relations
    define channels_admin: [user] or legacy_admin
    define guest: [user]
    define legacy_admin: [user]
    define member: [user] or legacy_admin or channels_admin
  `,

  entitlements: `
model
  schema 1.1

type feature
  relations
    define associated_plan: [plan]
    define can_access: subscriber_member from associated_plan

type organization
  relations
    define member: [user]

type plan
  relations
    define subscriber: [organization]
    define subscriber_member: member from subscriber

type user
  `,

  "custom-roles": `
model
  schema 1.1

type asset
  relations
    define category: [asset-category]
    define comment: [role#assignee] or edit or commenter from category
    define edit: [role#assignee] or editor from category
    define view: [role#assignee] or comment or viewer from category

type asset-category
  relations
    define asset_creator: [role#assignee] or asset_creator from org
    define commenter: [role#assignee] or editor or asset_commenter from org
    define editor: [role#assignee] or asset_editor from org
    define org: [org]
    define viewer: [role#assignee] or commenter or asset_viewer from org

type org
  relations
    define asset_category_creator: [role#assignee] or owner
    define asset_commenter: [role#assignee] or asset_editor
    define asset_creator: [role#assignee] or owner
    define asset_editor: [role#assignee] or owner
    define asset_viewer: [role#assignee] or asset_commenter
    define member: [user] or owner
    define owner: [user]
    define role_assigner: [role#assignee] or owner
    define role_creator: [role#assignee] or owner
    define team_assigner: [role#assignee] or owner
    define team_creator: [role#assignee] or owner

type role
  relations
    define assignee: [user, team#member, org#member]

type team
  relations
    define member: [user]

type user
  `,
};
