import { useEffect, useState } from 'react';
import { useBucketListStore, useProfileStore } from '@/stores';
import { BucketItem, CreateBucketItemData } from '@/services';
import { Card, CardContent, Button, Badge, ConfirmDialog } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { BucketItemForm, BucketItemCard, BucketCompleteDialog } from '@/components/bucketList';
import { toast } from '@/hooks/useToast';
import { Plus, ListTodo, Filter } from 'lucide-react';

export function BucketList() {
  const {
    items,
    stats,
    isLoading,
    fetchItems,
    fetchStats,
    createItem,
    updateItem,
    completeItem,
    deleteItem,
  } = useBucketListStore();
  const { fetchProfile } = useProfileStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BucketItem | null>(null);

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [itemToComplete, setItemToComplete] = useState<BucketItem | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Filter state - local filtering
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, [fetchItems, fetchStats]);

  // Filter items locally for immediate response
  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (statusFilter === 'completed' && !item.isCompleted) return false;
    if (statusFilter === 'pending' && item.isCompleted) return false;
    return true;
  });

  const handleFormSubmit = async (data: CreateBucketItemData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, data);
        toast({ title: 'Item updated', description: 'Your bucket list item has been updated.' });
      } else {
        await createItem(data);
        toast({
          title: 'Added to bucket list! 🪣',
          description: 'One more dream to chase!',
          variant: 'success',
        });
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteClick = (item: BucketItem) => {
    setItemToComplete(item);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = async (notes: string, actualCost?: number) => {
    if (!itemToComplete) return;
    setIsCompleting(true);
    try {
      // Update notes with review and actual cost info
      let finalNotes = notes;
      if (actualCost !== undefined) {
        finalNotes = `${notes}\n\nActual spent: ₹${actualCost.toLocaleString()}`;
      }

      const { pointsAwarded, achievements } = await completeItem(itemToComplete.id, finalNotes);
      await fetchProfile();
      toast({
        title: 'Dream achieved! 🎉',
        description: `You earned ${pointsAwarded} XP!`,
        variant: 'success',
      });
      // Show achievement notifications
      if (achievements && achievements.length > 0) {
        achievements.forEach((achievement) => {
          setTimeout(() => {
            toast({
              title: `🏆 Achievement Unlocked!`,
              description: `${achievement.icon} ${achievement.name} (+${achievement.pointsAwarded} XP)`,
              variant: 'success',
            });
          }, 500);
        });
      }
      setCompleteDialogOpen(false);
      setItemToComplete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete',
        variant: 'destructive',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDeleteClick = (item: BucketItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete.id);
      toast({ title: 'Item deleted', description: 'Removed from your bucket list.' });
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl animate-pulse">🪣</div>
          <p className="mt-2 text-muted-foreground">Loading bucket list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Bucket List</h1>
          <p className="text-muted-foreground">Things to do before you kick the bucket 🪣</p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {stats && (
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            Total: {stats.total}
          </Badge>
          <Badge variant="success" className="text-sm py-1 px-3">
            Done: {stats.completed}
          </Badge>
          <Badge variant="warning" className="text-sm py-1 px-3">
            Pending: {stats.pending}
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">
            ⚡ {stats.totalPoints} XP
          </Badge>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="TRAVEL">✈️ Travel</SelectItem>
            <SelectItem value="SKILLS">🎯 Skills</SelectItem>
            <SelectItem value="EXPERIENCES">🎭 Experiences</SelectItem>
            <SelectItem value="MILESTONES">🏆 Milestones</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListTodo className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No bucket list items</h3>
            <p className="text-muted-foreground text-center mt-1">
              {categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try changing your filters.'
                : 'Add your first dream to chase!'}
            </p>
            <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <BucketItemCard
              key={item.id}
              item={item}
              onEdit={(i) => {
                setEditingItem(i);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteClick}
              onComplete={handleCompleteClick}
            />
          ))}
        </div>
      )}

      <BucketItemForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        item={editingItem}
        isLoading={isSubmitting}
      />

      <BucketCompleteDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        item={itemToComplete}
        onConfirm={handleCompleteConfirm}
        isLoading={isCompleting}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Bucket Item"
        description={`Are you sure you want to delete "${itemToDelete?.title}"?`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
