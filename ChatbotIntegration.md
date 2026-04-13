AI Layer Frontend Integration Guide
This guide explains how to integrate the current AI/chat backend into frontend screens in the right sequence.
It is written for the backend that exists today in:
router.py
It covers:
what is ready now
what is still pending in the AI layer
which frontend screens should call which APIs
request/response examples
recommended UI flow for chat, clarification, charts, and debug
Readiness
Short answer:
yes, the backend APIs are ready for frontend integration for the main AI/chat experience
the current backend is strong enough for:
chat sessions
message history
normal ask/reply flow
clarification flow
result previews
chart suggestions
persisted debug traces
Known AI-layer gaps still pending:
Join dimension switching still needs improvement
example:
`by store` can still resolve like customer grouping in some join-analytics flows
More generalized entity counting across arbitrary joins/catalog views
payment/customer is now good
broader future joins still need more validation
More robust “new question vs follow-up” intent reset
current follow-up carry-forward is much better
but broader long-session reset behavior can still improve
More live validation on newly created catalog views
especially views with weaker metadata or unusual schemas
More automated tests
follow-up rewrite
clarification follow-through
join reuse
distinct counts
So the frontend can move now.
The main caveat is: ship with the current clarification UX and expect a few planner-quality refinements to continue in backend.
Main Screens
Recommended frontend AI screens:
AI Chat Session List
AI Chat Conversation Screen
Clarification Picker UI
Result Preview Panel
Chart / Visualization Panel
Debug Drawer or Admin Debug Screen
API Sequence
Recommended frontend sequence:
Login
Load chat sessions
Create or open a session
Load messages for that session
Ask a question
If clarification is required, show options and send the chosen option back as the next user message
If result preview/chart info is returned, render table/chart affordances
Optionally fetch persisted debug trace for admin/debug screens
---
1. Login
Use your existing auth flow:
```http
POST /auth/login
Content-Type: application/json
```
Example:
```json
{
  "login": "user@example.com",
  "password": "secret"
}
```
Response:
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 14400
}
```
Frontend:
store the token
send `Authorization: Bearer <token>` on all chat requests
---
2. Load Chat Sessions
Use:
```http
GET /chat/sessions
Authorization: Bearer <token>
```
Useful query params:
`skip`
`limit`
`has_debug_traces=true|false`
`debug_mode=summary|full`
`sort_by=updated_at|created_at|last_message_at|latest_trace_updated_at`
Example:
```http
GET /chat/sessions?skip=0&limit=20
```
Response shape:
```json
[
  {
    "id": "session-uuid",
    "title": "Payments analysis",
    "summary": "user asked ... | join context: iceberg....payment <-> iceberg....customer",
    "is_active": true,
    "last_message_at": "2026-04-12T20:00:00Z",
    "has_debug_traces": true,
    "debug_trace_count": 3,
    "latest_debug_mode": "summary",
    "latest_trace_updated_at": "2026-04-12T20:02:00Z"
  }
]
```
Frontend usage:
sidebar/session list
recent conversations
optional debug badge
---
3. Create Session
Use:
```http
POST /chat/sessions
Authorization: Bearer <token>
Content-Type: application/json
```
Example:
```json
{
  "title": "New AI Chat"
}
```
Response:
```json
{
  "id": "session-uuid",
  "title": "New AI Chat",
  "summary": null,
  "is_active": true
}
```
Frontend usage:
create a blank conversation shell
navigate to the conversation screen
---
4. Load Session Detail
Use:
```http
GET /chat/sessions/{session_id}
Authorization: Bearer <token>
```
Optional:
`include_debug_trace=false|true`
Example:
```http
GET /chat/sessions/{session_id}?include_debug_trace=false
```
Response contains:
session metadata
message list
lightweight debug badge fields on each message
Each message item includes:
`id`
`role`
`content`
`sql_generated`
`source_assets`
`visualization`
`retrieved_chunks`
`message_metadata`
`has_debug_trace`
`trace_version`
`trace_updated_at`
Frontend usage:
initial chat render
restore prior session state
---
5. Ask a Question
Main endpoint:
```http
POST /chat/sessions/{session_id}/ask
Authorization: Bearer <token>
Content-Type: application/json
```
Example request:
```json
{
  "content": "show payments with customer details",
  "top_k": 5,
  "max_rows": 25,
  "max_recent_messages": 8,
  "use_graph": true,
  "execute_sql": true
}
```
Main response fields:
`answer`
`sql_generated`
`sql_executed`
`execution_target`
`source_assets`
`retrieved_chunks`
`graph_facts`
`result_preview`
`visualization`
`chart_options`
`chart_prompt`
`needs_clarification`
`clarification_options`
Example successful response:
```json
{
  "session_id": "session-uuid",
  "user_message_id": "msg-user",
  "assistant_message_id": "msg-assistant",
  "answer": "I found 25 matching rows and I’m showing a preview of the result.",
  "sql_generated": "SELECT ... FROM ...",
  "sql_executed": true,
  "execution_target": "iceberg.org2_mkadium_postgres_emp_public.payment <-> iceberg.org2_mkadium_postgres_emp_public.customer",
  "source_assets": ["asset-1", "asset-2"],
  "needs_clarification": false,
  "clarification_options": [],
  "result_preview": {
    "columns": ["l_customer_id", "payment_date", "amount", "payment_id", "r_customer_id", "first_name", "email"],
    "rows": [],
    "row_objects": [],
    "display_fields": {
      "l_customer_id": "left_customer_label",
      "r_customer_id": "right_customer_label"
    },
    "column_metadata": {},
    "row_count": 25
  }
}
```
Frontend usage:
append the new user message immediately
render assistant reply when response returns
if `result_preview` exists, show a table preview
if `visualization` exists, show chart affordance
if `needs_clarification=true`, do not treat it as final analytical completion; show clarification picker
---
6. Clarification Flow
When backend is unsure, it returns:
`needs_clarification = true`
`clarification_options = [...]`
Example:
```json
{
  "answer": "For your question 'monthly totals for payments with customer details only above 10', I can answer it in a few different analytics groupings...",
  "needs_clarification": true,
  "clarification_options": [
    "overall total",
    "by customer id",
    "by store id",
    "by month"
  ]
}
```
Frontend behavior:
render the assistant text
render clarification chips/buttons from `clarification_options`
when the user clicks one, send that exact value back through the same `ask` endpoint as the next message
Example follow-up request:
```json
{
  "content": "by month"
}
```
Important:
do not invent your own hidden codes
send the selected option exactly as backend returned it
---
7. Result Preview UI
Use `result_preview` to render tables.
Fields:
`columns`
`rows`
`row_objects`
`display_fields`
`column_metadata`
`row_count`
Display rules:
use raw ids/fields for logic
prefer `display_fields[column]` when present for visible labels
prefer `column_metadata[column].display_label` for headers when present
fall back to raw column name when nothing richer exists
Example:
```json
{
  "columns": ["customer_id", "amount"],
  "display_fields": {
    "customer_id": "customer_label"
  },
  "row_objects": [
    {
      "customer_id": 42,
      "customer_label": "Customer 42",
      "amount": 10.5
    }
  ],
  "column_metadata": {
    "customer_id": {
      "display_label": "Customer identifier",
      "type": "integer",
      "description": "Customer identifier"
    }
  }
}
```
Frontend usage:
render `Customer 42` in table cells
keep `customer_id = 42` internally for sorting/filtering/actions
---
8. Chart / Visualization Flow
The backend can return:
`visualization`
`chart_options`
`chart_prompt`
Typical flow:
render table preview first
if `visualization` exists, show “View as chart”
if `chart_options` exists, show chart-type picker
if user selects another chart, call visualize endpoint
Example chart response fields:
```json
{
  "visualization": {
    "type": "line",
    "title": "Share Of Total Over Time",
    "x": "month_bucket",
    "x_label": "Month",
    "y": "total_amount",
    "y_label": "Total Payments",
    "series": ["first_name"],
    "series_label": "Customer"
  },
  "chart_options": [
    {
      "type": "line",
      "x": "month_bucket",
      "y": "total_amount",
      "series": ["first_name"]
    },
    {
      "type": "bar",
      "x": "month_bucket",
      "y": "total_amount"
    },
    {
      "type": "table",
      "columns": ["first_name", "month_bucket", "total_amount"]
    }
  ],
  "chart_prompt": "This result can be converted to a chart. Choose one of these chart types: line, bar."
}
```
To persist user-selected chart config:
```http
POST /chat/sessions/{session_id}/messages/{message_id}/visualize
Authorization: Bearer <token>
Content-Type: application/json
```
Example:
```json
{
  "type": "bar"
}
```
For more chart details, also see:
chat_visualization_integration.md
---
9. Streaming
If frontend uses SSE, use:
```http
POST /chat/sessions/{session_id}/messages/stream
Authorization: Bearer <token>
Accept: text/event-stream
```
Use streaming when:
you want incremental UX
you want to show “thinking / querying / final answer”
Use non-streaming `ask` when:
you want simpler initial integration
you’re building the first version of the AI screen
Recommendation:
first integrate `POST /chat/sessions/{session_id}/ask`
add streaming after the normal flow is stable
---
10. Debug / Admin Screens
For normal users:
do not enable debug
For admin/internal screens:
`debug_mode = "summary"` is the best default
`debug_mode = "full"` only when retrieval internals are needed
Example request:
```json
{
  "content": "show customer contact for payments above 10",
  "debug_mode": "summary"
}
```
Useful debug APIs:
```http
GET /chat/sessions/{session_id}/messages/{message_id}/debug
GET /chat/sessions/{session_id}/messages/debug
GET /chat/sessions/{session_id}/debug/export
```
Use these for:
support investigation
internal QA
planner/debug panels
---
Recommended Frontend Screen Flow
A. Session List Screen
Use:
`GET /chat/sessions`
Show:
title
last activity
debug badge if needed
B. Conversation Screen
Use:
`GET /chat/sessions/{id}`
`POST /chat/sessions/{id}/ask`
Show:
message history
answer text
result preview
chart CTA
clarification chips
C. Clarification Component
Input:
`needs_clarification`
`clarification_options`
Behavior:
render option buttons
send selected option back as a normal next `ask` request
D. Result Panel
Input:
`result_preview`
Behavior:
render preview table
use metadata and label fields for user-visible text
E. Chart Panel
Input:
`visualization`
`chart_options`
`chart_prompt`
Behavior:
render suggested chart
allow switching chart type
persist via `/visualize`
F. Debug Drawer
Input:
`debug_mode`
debug APIs above
Behavior:
planner explanation
SQL explanation
answer support
retrieval internals only in full mode
---
Recommended Integration Order
Implement in this order:
Login + token handling
Session list
Session detail + message rendering
Basic ask/reply flow
Clarification chips
Result preview tables
Chart affordances
Streaming
Admin/debug surfaces
This order keeps the frontend moving without waiting for every advanced AI feature.
---
Current Backend Strengths
Ready now:
session persistence
message persistence
short follow-up carry-forward
analytics clarification flow
table previews
chart suggestions
persisted debug traces
direct chat API contract for frontend
Known planner caveats still being improved:
some join dimension switches, especially `by store`
broader generalization to newly created catalog views with weaker metadata
more test coverage around edge-case follow-ups
These are backend quality refinements, not blockers for starting frontend integration.
Recommendation
Frontend should start now with the current backend.
Recommended rollout:
build the normal chat screen first using:
session list
session detail
ask endpoint
add clarification chips
add preview table and chart panel
add debug/admin tools last
That will let frontend move in parallel while backend keeps tightening the remaining planner edge cases.