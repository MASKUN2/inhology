import { deletePost } from '@/app/admin/actions';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';

/** The delete affordance for a post: asks before deleting. */
export function DeletePostButton({
  id,
  label,
  triggerClassName,
}: {
  id: string;
  label?: string;
  triggerClassName?: string;
}) {
  return (
    <ConfirmDeleteButton
      action={deletePost}
      id={id}
      title="Delete this post?"
      message="This permanently deletes the post and its comments. This can't be undone."
      label={label}
      triggerClassName={triggerClassName}
    />
  );
}
