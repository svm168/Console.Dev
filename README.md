# Console.Dev - Real-time Communication Platform

A high-performance, real-time collaboration hub engineered for developers. Features low-latency channel synchronization, sub-millisecond video conferencing streaming, rich markdown integration, and custom developer tools built on an optimized event-driven architecture.

## 🚀 Live Project Link

- https://consoledev-production.up.railway.app/

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Core Features](#core-features)
- [Installation & Setup](#installation--setup)
- [UI Optimization Approaches](#ui-optimization-approaches)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Custom Hooks](#custom-hooks)
- [Development](#development)

## 🎯 Overview

Console.Dev is a full-featured real-time communication platform that allows users to:
- Create and manage servers (communities)
- Organize conversations through text, audio, and video channels
- Send direct messages to other users
- Share files and media
- Manage user roles (Admin, Moderator, Guest)
- Experience real-time message updates via WebSockets
- Enjoy a polished, responsive user interface

The application prioritizes **real-time synchronization**, **optimistic updates**, and **performance optimization** to deliver a smooth communication experience.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16.2.6](https://nextjs.org/) - React 19 with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/)
- **State Management**: 
  - [Zustand 5.0.13](https://github.com/pmndrs/zustand) - Modal and UI state
  - [React Query 5.100.14](https://tanstack.com/query/latest) - Server state & caching
- **Form Handling**: [React Hook Form 7.76.1](https://react-hook-form.com/) with [Zod 4.4.3](https://zod.dev/) validation
- **Real-time**: [Socket.io Client 4.8.3](https://socket.io/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Lucide React Icons](https://lucide.dev/)

### Backend
- **API**: Next.js API Routes (Edge-compatible)
- **Database**: [MariaDB](https://mariadb.com/) with [Prisma 7.8.0](https://www.prisma.io/) ORM
- **Database Adapter**: [@prisma/adapter-mariadb](https://www.prisma.io/docs/orm/reference/prisma-client-reference#mariadb)
- **Real-time Server**: [Socket.io 4.8.3](https://socket.io/)
- **Authentication**: [Clerk 7.4.1](https://clerk.com/)
- **File Uploads**: [UploadThing 7.7.4](https://uploadthing.com/)
- **Media**: [LiveKit 2.15.4](https://livekit.io/)

### Additional Libraries
- **API Client**: [Axios 1.16.1](https://axios-http.com/)
- **Query Utils**: [query-string 9.4.0](https://github.com/sindresorhus/query-string)
- **Date Formatting**: [date-fns 4.4.0](https://date-fns.org/)
- **UUID Generation**: [uuid 14.0.0](https://github.com/uuidjs/uuid)
- **Class Merging**: [tailwind-merge 3.6.0](https://github.com/dcastil/tailwind-merge), [clsx 2.1.1](https://github.com/lukeed/clsx)
- **Emoji Support**: [@emoji-mart/react](https://www.npmjs.com/package/@emoji-mart/react)
- **Theme**: [next-themes 0.4.6](https://github.com/pacocoursey/next-themes)

## 🏗 Project Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│     Next.js App Router (Pages)          │
├─────────────────────────────────────────┤
│    Components (UI + Business Logic)     │
├─────────────────────────────────────────┤
│  Providers (Context: Socket, Query...)  │
├─────────────────────────────────────────┤
│    Custom Hooks (State Management)      │
├─────────────────────────────────────────┤
│    API Routes & Socket.io Server        │
├─────────────────────────────────────────┤
│  Libraries (Prisma, Clerk, UploadThing)│
├─────────────────────────────────────────┤
│        MariaDB Database                 │
└─────────────────────────────────────────┘
```

### Key Design Patterns

1. **Provider Pattern**: Root layout wraps app with multiple context providers
2. **Custom Hooks Pattern**: Encapsulates complex state logic (chat queries, socket events, scroll management)
3. **Optimistic Update Pattern**: Immediate UI updates with server reconciliation
4. **Modal State Pattern**: Centralized modal management via Zustand
5. **Server Component Rendering**: Sidebar and structural components use async/await for server-side rendering
6. **Component Composition**: Modular, reusable components with clear separation of concerns

## ✨ Core Features

### Communication
- **Text Channels**: Send and receive messages in real-time
- **Direct Messages**: Private one-to-one conversations
- **Audio Channels**: Voice communication with LiveKit integration
- **Video Channels**: Video call capabilities
- **Emoji Support**: Rich emoji picker for expressive messaging
- **File Sharing**: Upload and share media with UploadThing

### Server Management
- **Create Servers**: Build communities with unique invite codes
- **Channel Organization**: Categorize channels by type (Text/Audio/Video)
- **Member Management**: Manage user roles and permissions
- **Search Functionality**: Find channels and members quickly

### User Experience
- **Authentication**: Secure authentication via Clerk
- **Dark Mode**: Theme toggle with persistent preferences
- **Responsive Design**: Mobile-first responsive layouts
- **Real-time Updates**: Live message synchronization
- **Message Editing/Deletion**: Full message lifecycle management

### Administration
- **Role-based Access**: Admin, Moderator, and Guest roles
- **Member Invitations**: Shareable invite links
- **Channel CRUD**: Create, edit, and delete channels
- **Server Management**: Edit and delete servers

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- MariaDB database
- Clerk account (authentication)
- UploadThing account (file uploads)
- LiveKit account (optional, for voice/video)

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# UploadThing
UPLOADTHING_TOKEN=your_token

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: LiveKit
LIVEKIT_URL=your_livekit_url
LIVEKIT_KEY=your_key
LIVEKIT_SECRET=your_secret
```

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd console-dev

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build & Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🚀 UI Optimization Approaches

Console.Dev implements multiple sophisticated UI optimization techniques to ensure smooth performance and responsive user interactions:

### 1. **Infinite Scroll Query Pagination**
- **Location**: `hooks/use-chat-query.ts`
- **Implementation**: Uses `@tanstack/react-query`'s `useInfiniteQuery` hook
- **Benefit**: Lazy-loads messages in batches, reducing initial load time and memory usage
- **Key Features**:
  - Cursor-based pagination with `getNextPageParam`
  - Smart refetch interval based on socket connection status
  - Prevents unnecessary requests when connected to real-time updates

```typescript
// Smart refetch: Only when disconnected from socket
refetchInterval: isConnected ? false : 1000
```

### 2. **Optimistic Updates with Rollback**
- **Location**: `components/chat/chat-input.tsx`
- **Implementation**: Displays messages immediately with temporary IDs, then reconciles with server response
- **Benefit**: Provides instant feedback, reducing perceived latency
- **Key Features**:
  - Unique `tempId` prefixed with `temp_` for optimistic messages
  - Stores original content for conflict resolution
  - Graceful rollback on server errors
  - Tracks pending edits to prevent overwriting user changes

```typescript
const optimisticMessage = {
    id: tempId,  // Temporary ID for identification
    _tempId: tempId,
    isOptimistic: true,
    _originalContent: values.content,  // For rollback
    content: values.content,
    // ... other fields
}
```

### 3. **Smart Real-time Socket Integration**
- **Location**: `hooks/use-chat-socket.ts`
- **Implementation**: Intelligent cache updates via Socket.io events
- **Benefit**: Seamless real-time updates without full page refreshes
- **Key Features**:
  - Prevents duplicate entries when message arrives via both HTTP and Socket
  - Tracks pending edits to avoid overwriting user modifications
  - Differentiates between add and update events
  - Graceful handling of deleted messages

```typescript
// Smart deduplication: Check if message already in cache
const alreadyExists = newData[0].items.find((item: any) => item.id === message.id)
if(alreadyExists) return oldData;

// Check if HTTP request already handling this
const isHandledByHttp = newData[0].items.some((item: any) => 
    item.id.startsWith("temp_") && item.member.id === message.member.id
)
if (isHandledByHttp) return oldData;
```

### 4. **Advanced Scroll Management**
- **Location**: `hooks/use-chat-scroll.ts`
- **Implementation**: Custom scroll behavior with scroll position preservation
- **Benefit**: Perfect scroll UX when loading older messages
- **Key Features**:
  - Automatic scroll-to-bottom for new messages
  - Preserves scroll position when loading history
  - Tracks scroll distance from bottom (150px threshold)
  - Smooth scroll animation with 100ms delay

```typescript
// Preserve scroll position when loading older messages
if(scrollDiff > 0) topDiv.scrollTop += scrollDiff;

// Auto-scroll only if within 150px of bottom
const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight
isScrolledToBottomRef.current = distanceFromBottom <= 150
```

### 5. **React Query Cache Management**
- **Location**: `hooks/use-chat-query.ts`, `hooks/use-chat-socket.ts`
- **Implementation**: Sophisticated `queryClient.setQueryData` updates
- **Benefit**: Centralized server state management with predictable updates
- **Key Features**:
  - Atomic updates to infinite query pages
  - Maintains data structure consistency
  - Prevents race conditions
  - Efficient re-renders only when data changes

### 6. **Optimistic Channel State Management**
- **Location**: `hooks/use-optimistic-channels.ts`
- **Implementation**: Zustand store for pending channel operations
- **Benefit**: Instant UI feedback for channel CRUD operations
- **Key Features**:
  - Tracks pending creates, edits, and deletes separately
  - ID swapping from temporary to real IDs
  - Prevents optimistic updates from reverting on server response

```typescript
interface OptimisticChannelsStore {
    pendingCreates: Record<string, Channel>;
    pendingEdits: Record<string, Partial<Channel>>;
    pendingDeletes: Record<string, boolean>;
    swapId: (tempId: string, realId: string) => void;
}
```

### 7. **Modal Provider with Hydration Safety**
- **Location**: `components/providers/modal-provider.tsx`
- **Implementation**: Deferred mounting to prevent hydration mismatches
- **Benefit**: Prevents SSR/client mismatch errors in Next.js
- **Key Features**:
  - `isMounted` state check before rendering
  - All 11 modals mounted at root level
  - Centralized state via `useModal` hook

```typescript
const [isMounted, setIsMounted] = useState(false);
useEffect(() => {
    setIsMounted(true);  // Only render after hydration
}, []);

if(!isMounted) return null
```

### 8. **Socket.io Provider with Connection Status**
- **Location**: `components/providers/socket-provider.tsx`
- **Implementation**: Persistent WebSocket connection with status tracking
- **Benefit**: Enables conditional logic based on connection state
- **Key Features**:
  - Single socket instance per app lifecycle
  - Connection status available via context
  - Graceful disconnect/reconnect handling

```typescript
const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    
    useEffect(() => {
        const socketInstance = new ClientIO(...)
        socketInstance.on("connect", () => setIsConnected(true))
        // ...
    }, [])
}
```

### 9. **Efficient Message Rendering**
- **Location**: `components/chat/chat-messages.tsx`
- **Implementation**: Fragment-based rendering with proper key management
- **Benefit**: Optimal React reconciliation and re-renders
- **Key Features**:
  - Maps groups of messages with Fragment wrapper
  - Unique keys for each message (temp ID or real ID)
  - Reverse flex for newest-first layout

```typescript
{data?.pages?.map((group, i) => (
    <Fragment key={i}>
        {group.items.map((message: any) => (
            <ChatItem 
                key={message._tempId || message.id}  // Prioritize temp ID
                // ...
            />
        ))}
    </Fragment>
))}
```

### 10. **Database Connection Pooling**
- **Location**: `lib/db.ts`
- **Implementation**: MariaDB connection limit and singleton pattern
- **Benefit**: Efficient database connection management
- **Key Features**:
  - Connection limit of 10 concurrent connections
  - TLS/SSL security
  - Singleton pattern for Prisma Client
  - Conditional logging in development

```typescript
const adapter = new PrismaMariaDb({
    // ... connection details
    connectionLimit: 10,  // Limit concurrent connections
    ssl: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    }
});

if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = db;  // Hot reload in dev
}
```

### 11. **Class Merging Utility**
- **Location**: `lib/utils.ts`
- **Implementation**: `tailwind-merge` + `clsx` combination
- **Benefit**: Prevents Tailwind CSS class conflicts
- **Key Features**:
  - Resolves conflicting utility classes
  - Enables dynamic class composition
  - Used throughout component library

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Usage: cn("px-2", "px-4") → "px-4" (resolved)
```

## 📊 Database Schema

The application uses a relational database with the following core entities:

### Profile
User profiles linked to Clerk authentication
```prisma
- id (UUID, Primary Key)
- userId (Unique, from Clerk)
- name, email, imageUrl
- Relationships: servers, members, channels
```

### Server
Communities/organizations with members and channels
```prisma
- id (UUID, Primary Key)
- name, imageUrl, inviteCode (Unique)
- profileId (FK to Profile, Cascade Delete)
- Relationships: members, channels
```

### Member
User's role and status within a server
```prisma
- id (UUID, Primary Key)
- role (ADMIN, MODERATOR, GUEST)
- profileId, serverId (Foreign Keys)
- Relationships: messages, directMessages, conversations
```

### Channel
Text, Audio, or Video communication channels
```prisma
- id (UUID, Primary Key)
- name, type (TEXT, AUDIO, VIDEO)
- profileId, serverId (Foreign Keys)
- Relationships: messages
- Indexes: [serverId, profileId]
```

### Message
Text messages in channels
```prisma
- id (UUID, Primary Key)
- content (Text), fileUrl (optional)
- memberId, channelId (Foreign Keys)
- deleted (Boolean, soft delete)
- createdAt, updatedAt (Timestamps)
- Indexes: [channelId, memberId]
```

### Conversation
One-to-one direct messaging threads
```prisma
- id (UUID, Primary Key)
- memberOneId, memberTwoId (Foreign Keys)
- Unique: [memberOneId, memberTwoId]
- Relationships: directMessages
```

### DirectMessage
Messages in direct conversations
```prisma
- id (UUID, Primary Key)
- content (Text), fileUrl (optional)
- memberId, conversationId (Foreign Keys)
- deleted (Boolean, soft delete)
- createdAt, updatedAt (Timestamps)
```

**Database Configuration**:
- Provider: MySQL with MariaDB
- Relation Mode: Prisma (handles cross-database relations)
- Connection Pooling: 10 connections max
- SSL/TLS: Enabled with TLSv1.2 minimum

## 🔌 API Routes

The application provides RESTful API endpoints for all operations:

### Channels
- `POST /api/channels` - Create channel
- `PATCH /api/channels/:id` - Edit channel
- `DELETE /api/channels/:id` - Delete channel

### Messages
- `POST /api/messages` - Create message
- `PATCH /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages` - Fetch messages (paginated)

### Direct Messages
- `POST /api/direct-messages` - Create DM
- `PATCH /api/direct-messages/:id` - Edit DM
- `DELETE /api/direct-messages/:id` - Delete DM
- `GET /api/direct-messages` - Fetch DMs (paginated)

### Servers
- `POST /api/servers` - Create server
- `PATCH /api/servers/:id` - Edit server
- `DELETE /api/servers/:id` - Delete server
- `GET /api/servers/:id` - Fetch server with relations

### Members
- `PATCH /api/members/:id` - Update member role
- `DELETE /api/members/:id` - Remove member from server
- `GET /api/members` - Fetch server members

### Real-time Socket Events
- `chat:channelId:messages` - New message added (broadcast)
- `chat:channelId:messages:update` - Message updated (broadcast)
- Similar events for direct messages

### Third-party Integration Routes
- `/api/uploadthing` - File upload handling
- `/api/livekit` - Video/audio token generation
- `/api/socket/io` - WebSocket connection handler

## 📂 Project Structure

```
console-dev/
├── app/                           # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── channels/
│   │   ├── direct-messages/
│   │   ├── livekit/
│   │   ├── members/
│   │   ├── messages/
│   │   ├── servers/
│   │   └── uploadthing/
│   ├── (auth)/                   # Auth layout group
│   ├── (invite)/                 # Invite handling group
│   ├── (main)/                   # Main app layout group
│   ├── (setup)/                  # Setup flow layout group
│   ├── layout.tsx                # Root layout with providers
│   └── globals.css               # Global styles
│
├── components/                    # React components
│   ├── chat/                     # Chat-related components
│   │   ├── chat-header.tsx
│   │   ├── chat-input.tsx
│   │   ├── chat-item.tsx
│   │   ├── chat-messages.tsx
│   │   ├── chat-video-button.tsx
│   │   ├── chat-audio-button.tsx
│   │   ├── chat-audio-recorder.tsx
│   │   ├── chat-welcome.tsx
│   │   ├── media-preview.tsx
│   │   └── media-room.tsx
│   │
│   ├── modals/                   # Modal components
│   │   ├── create-server-modal.tsx
│   │   ├── invite-modal.tsx
│   │   ├── edit-server-modal.tsx
│   │   ├── delete-server-modal.tsx
│   │   ├── members-modal.tsx
│   │   ├── leave-server-modal.tsx
│   │   ├── create-channel-modal.tsx
│   │   ├── edit-channel-modal.tsx
│   │   ├── delete-channel-modal.tsx
│   │   ├── message-file-modal.tsx
│   │   └── delete-message-modal.tsx
│   │
│   ├── providers/                # Context providers
│   │   ├── modal-provider.tsx
│   │   ├── query-provider.tsx
│   │   ├── socket-provider.tsx
│   │   └── theme-provider.tsx
│   │
│   ├── server/                   # Server-side rendered components
│   │   ├── server-sidebar.tsx
│   │   ├── server-header.tsx
│   │   ├── server-search.tsx
│   │   ├── server-section.tsx
│   │   ├── server-channel.tsx
│   │   ├── server-channel-section.tsx
│   │   ├── server-member.tsx
│   │   └── server-optimistic-channels.tsx
│   │
│   ├── navigation/               # Navigation components
│   │   ├── navigation-sidebar.tsx
│   │   ├── navigation-item.tsx
│   │   └── navigation-action.tsx
│   │
│   ├── ui/                       # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── scroll-area.tsx
│   │   └── ... (other UI primitives)
│   │
│   ├── action-tooltip.tsx
│   ├── call-notification.tsx
│   ├── emoji-picker.tsx
│   ├── file-upload.tsx
│   ├── mobile-toggle.tsx
│   ├── mode-toggle.tsx
│   ├── socket-indicator.tsx
│   └── user-avatar.tsx
│
├── hooks/                         # Custom React hooks
│   ├── use-chat-query.ts         # Infinite message query
│   ├── use-chat-socket.ts        # Real-time socket updates
│   ├── use-chat-scroll.ts        # Scroll management
│   ├── use-modal-store.ts        # Modal state (Zustand)
│   ├── use-optimistic-channels.ts # Channel optimistic updates
│   ├── use-media-preview.ts
│   ├── use-origin.ts
│   └── use-server-action.ts
│
├── lib/                           # Utility functions
│   ├── db.ts                     # Prisma client setup
│   ├── utils.ts                  # Class merging utility
│   ├── current-profile.ts        # Clerk integration
│   ├── initial-profile.ts        # Profile initialization
│   ├── uploadthing.ts            # File upload config
│   ├── conversation.ts           # Conversation helpers
│   └── current-profile-pages.ts  # API route helpers
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── public/                        # Static assets
│
├── types.ts                       # TypeScript type definitions
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
├── package.json                  # Dependencies
└── README.md                      # This file
```

## 🧩 Key Components

### Chat Components
- **ChatMessages**: Main message container with infinite scroll
- **ChatItem**: Individual message with edit/delete actions
- **ChatInput**: Message input with file/emoji support
- **ChatHeader**: Channel/conversation header with info
- **ChatWelcome**: Welcome state for new channels
- **MediaRoom**: LiveKit video/audio component

### Modal Components (Zustand-managed)
All modals are centrally managed and rendered at the root level:
- **CreateServerModal**: Server creation workflow
- **EditServerModal**: Server settings editing
- **InviteModal**: Generate/share invite codes
- **MembersModal**: Manage server members
- **CreateChannelModal**: Add new channels
- **EditChannelModal**: Channel settings
- **DeleteServerModal**: Server deletion confirmation
- **DeleteChannelModal**: Channel deletion confirmation
- **LeaveServerModal**: Leave server confirmation
- **MessageFileModal**: File attachment preview
- **DeleteMessageModal**: Message deletion confirmation

### Server Components (Server-Side Rendering)
- **ServerSidebar**: Server-side fetched sidebar with channels/members
- **ServerSearch**: Command palette search for channels/members
- **ServerSection**: Categorized channel/member sections
- **ServerChannelSection**: Grouped channels by type

### UI Components (Shadcn/ui)
Comprehensive set of accessible, unstyled components:
- Form elements: Input, Textarea, Field, Label
- Layout: Scroll-Area, Separator, Dialog
- Navigation: Dropdown-Menu, Command (cmdk)
- Data: Badge, Avatar
- Feedback: Button, others

## 🎣 Custom Hooks

### useChatQuery
Manages infinite pagination of messages with smart refetch logic
```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
    queryKey: "chat:123",
    apiUrl: "/api/messages",
    paramKey: "channelId",
    paramValue: "123"
})
```

### useChatSocket
Handles real-time socket events and cache synchronization
```typescript
useChatSocket({
    queryKey: "chat:123",
    addKey: "chat:123:messages",
    updateKey: "chat:123:messages:update"
})
```

### useChatScroll
Manages scroll behavior, loading more messages, and auto-scroll
```typescript
useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: messageCount
})
```

### useModal
Zustand hook for centralized modal state
```typescript
const { type, data, isOpen, onOpen, onClose } = useModal()

// Open modal with data
onOpen("editServer", { server: myServer })
```

### useOptimisticChannels
Manages pending channel create/edit/delete operations
```typescript
const { pendingCreates, addCreate, swapId } = useOptimisticChannels()
```

### useMediaPreview
Handles media preview state and auto-play logic

### useOrigin
Gets the current app origin URL (for invite links, etc.)

## 💻 Development

### Development Server
```bash
npm run dev
# Runs on http://localhost:3000 with Webpack
```

### Building
```bash
npm run build
# Optimizes for production deployment
```

### Production
```bash
npm start
# Starts the production server
```

### Linting
```bash
npm run lint
# Runs ESLint on the codebase
```

### Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name description

# Open Prisma Studio (visual DB explorer)
npx prisma studio

# Reset database (⚠️ production only with caution)
npx prisma migrate reset
```

## 🔐 Security Features

- **Authentication**: Clerk for secure user authentication
- **Authorization**: Role-based access control (Admin/Moderator/Guest)
- **Data Validation**: Zod schema validation on all inputs
- **SSL/TLS**: Encrypted database connections
- **Soft Deletes**: Messages/servers marked as deleted, not removed
- **CORS**: Properly configured API access

## 🎨 UI/UX Features

- **Dark Mode**: System-aware theme with Clerk integration
- **Responsive Design**: Mobile-first Tailwind CSS layout
- **Accessibility**: Radix UI components with ARIA support
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Animations**: Smooth transitions and hover effects
- **Emoji Support**: Rich emoji picker for messages

## 📈 Performance Metrics

- **Initial Load**: Optimized with server-side rendering
- **Message Loading**: Lazy-loaded via infinite scroll
- **Real-time Updates**: Socket.io with smart cache reconciliation
- **Bundle Size**: Tree-shaking optimizations with Next.js
- **Database**: Indexed queries with connection pooling

## 🚀 Future Enhancement Ideas

- Message search and filtering
- User presence indicators (online/offline)
- Read receipts for messages
- Message reactions
- Message threading/replies
- Custom User profiles and statuses
- Server templates
- Analytics dashboard
- Mobile app (React Native)
- End-to-end encryption
