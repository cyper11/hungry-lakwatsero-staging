import React, { useState } from 'react';
import axios from 'axios';
import { Star, Edit2, Trash2, Calendar, MapPin, X, Check } from 'lucide-react';

// Mock removed

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ text: '', rating: 0 });
  const [deletingId, setDeletingId] = useState(null);
  
  const toast = useToast();

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get('/api/reviews/mine');
        setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleEditClick = (review) => {
    setEditingId(review.id);
    setEditForm({ text: review.content, rating: review.rating_value });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`/api/reviews/${id}`, {
        content: editForm.text,
        ratingValue: editForm.rating
      });
      setReviews(reviews.map(r => r.id === id ? { ...r, content: editForm.text, rating_value: editForm.rating } : r));
      setEditingId(null);
      toast.success('Review updated successfully');
    } catch (err) {
      toast.error('Failed to update review');
    }
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`/api/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      setDeletingId(null);
      toast.info('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating, isInteractive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-5 h-5 ${star <= rating ? 'text-gold-500 fill-gold-500' : 'text-sage-400/30'} ${isInteractive ? 'cursor-pointer hover:text-gold-400' : ''}`}
            onClick={isInteractive ? () => setEditForm({...editForm, rating: star}) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="page-content min-h-screen bg-background text-primary font-body">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display text-emerald-600 dark:text-emerald-400 mb-2">My Reviews</h1>
          <p className="text-muted">Manage your culinary experiences and feedback.</p>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-card backdrop-blur-md border border-primary/10 rounded-2xl p-12 text-center glass-dark">
            <h2 className="text-xl font-medium text-primary mb-2">No reviews yet</h2>
            <p className="text-muted">Share your dining experiences with the community!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-card backdrop-blur-md border border-primary/10 rounded-2xl p-6 glass-dark transition-all"
              >
                {/* Delete Confirmation Overlay inside card */}
                {deletingId === review.id ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Trash2 className="w-12 h-12 text-red-500 mb-4 opacity-80" />
                    <h3 className="text-xl text-primary font-medium mb-2">Delete this review?</h3>
                    <p className="text-sage-400 mb-6">This action cannot be undone.</p>
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => setDeletingId(null)}
                        className="px-6 py-2 rounded-full border border-sage-400/30 text-primary hover:bg-sage-400/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => confirmDelete(review.id)}
                        className="px-6 py-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : editingId === review.id ? (
                  /* Edit Form */
                  <div className="space-y-4 py-2">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-serif text-emerald-400">{review.restaurant?.name || 'Unknown Restaurant'}</h3>
                        <p className="text-sm text-sage-400 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" /> {review.restaurant?.municipality_name || 'Unknown Location'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm text-sage-400 mb-2">Rating</label>
                      {renderStars(editForm.rating, true)}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm text-sage-400 mb-2">Your Review</label>
                      <textarea
                        value={editForm.text}
                        onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                        className="w-full bg-secondary/50 border border-sage-400/20 rounded-xl p-4 text-primary focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[120px] resize-y"
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-4">
                      <button 
                        onClick={handleCancelEdit}
                        className="flex items-center px-4 py-2 rounded-full border border-sage-400/30 text-sage-300 hover:bg-sage-400/10 transition-colors text-sm"
                      >
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveEdit(review.id)}
                        className="flex items-center px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-cream-50 transition-colors text-sm"
                      >
                        <Check className="w-4 h-4 mr-1" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal View */
                  <>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                      <div>
                        <h3 className="text-xl font-serif text-primary">{review.restaurant?.name || 'Unknown Restaurant'}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                          {renderStars(review.rating_value)}
                          <span className="flex items-center text-sm text-sage-400">
                            <MapPin className="w-3.5 h-3.5 mr-1" /> {review.restaurant?.municipality_name || 'Unknown Location'}
                          </span>
                          <span className="flex items-center text-sm text-sage-400">
                            <Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 shrink-0 self-end md:self-start">
                        <button 
                          onClick={() => handleEditClick(review)}
                          className="p-2 rounded-full bg-secondary/30 text-sage-300 hover:text-emerald-400 hover:bg-secondary/60 transition-colors border border-transparent hover:border-emerald-500/30"
                          aria-label="Edit review"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingId(review.id)}
                          className="p-2 rounded-full bg-secondary/30 text-sage-300 hover:text-red-400 hover:bg-secondary/60 transition-colors border border-transparent hover:border-red-500/30"
                          aria-label="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-primary/90 leading-relaxed border-t border-sage-400/10 pt-4">
                      <p>"{review.content}"</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
