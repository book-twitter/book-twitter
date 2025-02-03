import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Post {
  id: number
  user: string
  book: string
  page: number
  content: string
  totalPages: number
}

export default function PostCard({ post }: { post: Post }) {
  const isSpoiler = post.page > post.totalPages * 0.75 // Consider it a spoiler if past 75% of the book

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarFallback>{post.user[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.user}</p>
          <p className="text-sm text-muted-foreground">
            {post.book} - Page {post.page}
          </p>
        </div>
        {isSpoiler && <Badge variant="destructive">Spoiler</Badge>}
      </CardHeader>
      <CardContent>
        <p>{isSpoiler ? "This post may contain spoilers. Click to reveal." : post.content}</p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Reading progress: {Math.round((post.page / post.totalPages) * 100)}%
        </p>
      </CardFooter>
    </Card>
  )
}

