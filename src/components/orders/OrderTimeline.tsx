'use client';

import { CheckCircle, Package, Truck, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

interface OrderTimelineProps {
  status: OrderStatus;
  className?: string;
  statusHistory?: Array<{
    status: OrderStatus;
    timestamp: string | Date;
  }>;
  paidAt?: string | Date;
  deliveredAt?: string | Date;
}

interface TimelineStep {
  key: string;
  label: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  timestamp?: string | Date;
}

export function OrderTimeline({ status, className, statusHistory, paidAt, deliveredAt }: OrderTimelineProps) {
  
  const formatDateTime = (dateString?: string | Date) => {
    if (!dateString) return '';
    
    try {
      // Handle Firestore Timestamp objects converted to string
      let date: Date;
      
      if (typeof dateString === 'string') {
        // Check if it's an ISO date string
        if (dateString.match(/^\d{4}-\d{2}-\d{2}T/)) {
          date = new Date(dateString);
        } else {
          // Try to parse various formats
          const parsedDate = new Date(dateString);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
          } else {
            return '';
          }
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        // Handle Firestore Timestamp
        const timestamp = dateString as any;
        if (timestamp && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else if (timestamp && timestamp.seconds) {
          date = new Date(timestamp.seconds * 1000);
        } else {
          return '';
        }
      }
      
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '';
    }
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Not Available';
    
    try {
      // Handle Firestore Timestamp objects converted to string
      let date: Date;
      
      if (typeof dateString === 'string') {
        // Check if it's an ISO date string
        if (dateString.match(/^\d{4}-\d{2}-\d{2}T/)) {
          date = new Date(dateString);
        } else {
          // Try to parse various formats
          const parsedDate = new Date(dateString);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
          } else {
            return 'Not Available';
          }
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        // Handle Firestore Timestamp
        const timestamp = dateString as any;
        if (timestamp && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else if (timestamp && timestamp.seconds) {
          date = new Date(timestamp.seconds * 1000);
        } else {
          return 'Not Available';
        }
      }

      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return 'Not Available';
    }
  };

  const getTimestampForStatus = (stepStatus: string) => {
    // If status history is provided, use it
    if (statusHistory && statusHistory.length > 0) {
      const historyEntry = statusHistory.find(entry => entry.status === stepStatus);
      if (historyEntry && historyEntry.timestamp) {
        return formatDateTime(historyEntry.timestamp);
      }
    }
    
    return '';
  };

  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        key: 'pending',
        label: 'Order Placed',
        icon: <Clock className="h-4 w-4" />,
        status: 'completed'
      },
      {
        key: 'processing',
        label: 'Processing',
        icon: <Package className="h-4 w-4" />,
        status: 'pending'
      },
      {
        key: 'packed',
        label: 'Packed',
        icon: <Package className="h-4 w-4" />,
        status: 'pending'
      },
      {
        key: 'shipped',
        label: 'Shipped',
        icon: <Truck className="h-4 w-4" />,
        status: 'pending'
      },
      {
        key: 'delivered',
        label: 'Delivered',
        icon: <CheckCircle className="h-4 w-4" />,
        status: 'pending'
      }
    ];

    // Map status to timeline with timestamps
    if (status === 'cancelled') {
      steps[0].status = 'completed';
      steps[1].status = 'skipped';
      steps[2].status = 'skipped';
      steps[3].status = 'skipped';
      steps[4].status = 'skipped';
    } else if (status === 'delivered') {
      steps.forEach(step => step.status = 'completed');
    } else if (status === 'shipped') {
      steps[0].status = 'completed';
      steps[1].status = 'completed';
      steps[2].status = 'completed';
      steps[3].status = 'completed';
      steps[4].status = 'current';
    } else if (status === 'packed') {
      steps[0].status = 'completed';
      steps[1].status = 'completed';
      steps[2].status = 'current';
      steps[3].status = 'pending';
      steps[4].status = 'pending';
    } else if (status === 'processing') {
      steps[0].status = 'completed';
      steps[1].status = 'current';
      steps[2].status = 'pending';
      steps[3].status = 'pending';
      steps[4].status = 'pending';
    } else if (status === 'pending') {
      steps[0].status = 'current';
      steps[1].status = 'pending';
      steps[2].status = 'pending';
      steps[3].status = 'pending';
      steps[4].status = 'pending';
    }

    // Add timestamps to steps
    steps[0].timestamp = statusHistory?.[0]?.timestamp; // Order placed timestamp
    
    return steps;
  };

  const steps = getTimelineSteps();

  const getStepStyles = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'current':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'skipped':
        return 'bg-gray-100 text-gray-400 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>

      {/* Payment Status Display */}
      {paidAt && status !== 'cancelled' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Payment:</span>
            <span className="font-medium text-green-900">Paid</span>
            <span className="text-gray-500">on</span>
            <span className="font-semibold text-green-900">{formatDate(paidAt)}</span>
            <span className="text-gray-400 text-xs">at {formatDateTime(paidAt)}</span>
          </div>
        </div>
      )}

      {/* Delivery Status Display */}
      {deliveredAt && status === 'delivered' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Delivered:</span>
            <span className="font-medium text-green-900">Delivered</span>
            <span className="text-gray-500">on</span>
            <span className="font-semibold text-green-900">{formatDate(deliveredAt)}</span>
            <span className="text-gray-400 text-xs">at {formatDateTime(deliveredAt)}</span>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200 -z-10" />

        {steps.map((step, index) => {
          const stepTimestamp = getTimestampForStatus(step.key);
          
          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Step icon circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center z-10',
                  getStepStyles(step.status)
                )}
              >
                {step.icon}
              </div>

              {/* Step content */}
              <div className="flex-1 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p
                    className={cn(
                      'font-medium',
                      step.status === 'completed' || step.status === 'current'
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.status === 'current' && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>

                {/* Display timestamp if available */}
                {stepTimestamp && step.status === 'completed' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(stepTimestamp)}
                  </p>
                )}

                {step.status === 'completed' && index < steps.length - 1 && (
                  <p className="text-sm text-gray-500 mt-1">
                    ✓ Step completed
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status-specific messages */}
      {status === 'cancelled' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Order Cancelled</p>
              <p className="text-sm text-red-700 mt-1">
                This order has been cancelled. Please contact support if you have any questions.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'delivered' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Order Delivered!</p>
              <p className="text-sm text-green-700 mt-1">
                Your order has been successfully delivered. Thank you for shopping with us!
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'shipped' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Order Shipped</p>
              <p className="text-sm text-blue-700 mt-1">
                Your order is on its way! You should receive it soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
