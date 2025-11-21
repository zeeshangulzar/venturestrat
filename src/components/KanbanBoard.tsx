'use client';

import { useState } from 'react';
import { updateInvestorStatus } from '@lib/api';
import ChatGPTIntegration from '@components/ChatGPTIntegration';
import Tooltip from '@components/Tooltip';
import { Investor } from '@hooks/useUserShortlist';
import ContactInfoMask from './ContactInfoMask';

interface KanbanBoardProps {
  investors: Investor[];
  onStatusChange: (shortlistId: string, newStatus: string) => void;
  onInvestorClick: (investorId: string) => void;
  user: any;
  userData: any;
  userDataLoading: boolean;
  onEmailGenerated: (message: string) => void;
  onError: (error: string) => void;
  onEmailCreated: (emailId: string, isAI: boolean, investorId: string) => void;
  onEmailSent?: (investorId: string) => void;
}

const statusColumns = [
  { 
    id: 'TARGET', 
    title: 'Shortlisted', 
    color: 'bg-gray-50',
    dotColor: 'bg-red-500',
    textColor: 'text-gray-700'
  },
  { 
    id: 'CONTACTED', 
    title: 'Contacted', 
    color: 'bg-gray-50',
    dotColor: 'bg-orange-500',
    textColor: 'text-gray-700'
  },
  { 
    id: 'INTERESTED', 
    title: 'Interested', 
    color: 'bg-gray-50',
    dotColor: 'bg-green-500',
    textColor: 'text-gray-700'
  },
  { 
    id: 'CLOSED', 
    title: 'Closed', 
    color: 'bg-gray-50',
    dotColor: 'bg-blue-500',
    textColor: 'text-gray-700'
  }
];

export default function KanbanBoard({
  investors,
  onStatusChange,
  onInvestorClick,
  user,
  userData,
  userDataLoading,
  onEmailGenerated,
  onError,
  onEmailCreated,
  onEmailSent
}: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<Investor | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Group investors by status
  const groupedInvestors = statusColumns.reduce((acc, column) => {
    acc[column.id] = investors.filter(inv => inv.status === column.id);
    return acc;
  }, {} as Record<string, Investor[]>);

  const handleDragStart = (e: React.DragEvent, investor: Investor) => {
    setDraggedItem(investor);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem || draggedItem.status === targetColumnId) {
      setDraggedItem(null);
      return;
    }

    // Update UI immediately
    onStatusChange(draggedItem.shortlistId, targetColumnId);

    // Update backend
    setIsUpdating(draggedItem.shortlistId);
    try {
      await updateInvestorStatus(draggedItem.shortlistId, targetColumnId);
    } catch (error) {
      console.error('Failed to update investor status:', error);
      // Revert the UI change on error
      onStatusChange(draggedItem.shortlistId, draggedItem.status);
    } finally {
      setIsUpdating(null);
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-4 p-6 overflow-x-auto bg-[#F4F6FB] h-[600px]">
      {statusColumns.map((column) => (
        <div
          key={column.id}
          className={`flex-1 min-w-[280px] max-w-[400px] bg-[#F4F6FB] transition-colors flex flex-col ${
            dragOverColumn === column.id ? 'border-dashed border-gray-400' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.dotColor}`}></div>
                <h3 className={`font-semibold ${column.textColor}`}>
                  {column.title}
                </h3>
                <div className={`text-sm ${column.textColor} bg-white px-2 py-1 rounded-full`}>
                  {groupedInvestors[column.id]?.length || 0}
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Investor Cards */}
          <div className="flex-1 mt-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {groupedInvestors[column.id]?.map((investor) => (
              <div
                key={investor.id}
                draggable
                onDragStart={(e) => handleDragStart(e, investor)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-lg border border-gray-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                  isUpdating === investor.shortlistId ? 'opacity-50' : ''
                } ${
                  draggedItem?.id === investor.id ? 'opacity-50' : ''
                }`}
                onClick={() => onInvestorClick(investor.id)}
              >
                {/* Investor Info - Name and Email on same row */}
                <div className="mb-3">
                  <div className="flex w-full">
                    <div className='w-1/2 flex flex-col justify-start pr-3 overflow-hidden'>
                      <div className="not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89] mb-1">Investor Name</div>
                      <Tooltip content={investor.name}>
                        <h4 className="not-italic font-semibold text-[16px] leading-[24px] tracking-[-0.02em] text-[#0C2143] truncate w-full text-ellipsis">
                          {investor.name}
                        </h4>
                      </Tooltip>
                    </div>
                    <div className='w-1/2 flex flex-col justify-start pl-3 overflow-hidden'>
                      <div className="not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89] mb-1">Email Address</div>
                      <div className="flex items-center gap-1 w-full min-w-0">
                        <Tooltip content={investor.emails?.[0]?.email || 'N/A'} shouldMask={true}>
                          <div className="not-italic font-semibold text-[16px] leading-[24px] tracking-[-0.02em] text-[#0C2143] truncate w-full min-w-0 text-ellipsis">
                            <ContactInfoMask>{investor.emails?.[0]?.email || 'N/A'}</ContactInfoMask>
                          </div>
                        </Tooltip>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Position and Location on same row */}
                <div className="mb-4">
                  <div className="flex w-full">
                    <div className='w-1/2 flex flex-col justify-start pr-3 overflow-hidden'>
                      <div className="not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89] mb-1">Position</div>
                      <Tooltip content={investor.companyName || 'CO - Founder'}>
                        <div className="not-italic font-semibold text-[16px] leading-[24px] tracking-[-0.02em] text-[#0C2143] truncate w-full text-ellipsis">
                          {investor.companyName || 'CO - Founder'}
                        </div>
                      </Tooltip>
                    </div>
                    <div className='w-1/2 flex flex-col justify-start pl-3 overflow-hidden'>
                      <div className="not-italic font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#787F89] mb-1">Location</div>
                      <Tooltip content={investor.state ? `${investor.state}, ${investor.country}` : investor.country || 'New York, USA'}>
                        <div className="not-italic font-semibold text-[16px] leading-[24px] tracking-[-0.02em] text-[#0C2143] truncate w-full text-ellipsis">
                          {investor.state ? `${investor.state}, ${investor.country}` : investor.country || 'New York, USA'}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>


                {/* AI Email Button - Only for TARGET status */}
                {investor.status === 'TARGET' && user && userData && !userDataLoading && investor.emails.length > 0 && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ChatGPTIntegration
                      investor={investor}
                      user={user}
                      userData={userData}
                      onEmailGenerated={onEmailGenerated}
                      onError={onError}
                      onEmailCreated={(emailId, isAI) => onEmailCreated(emailId, isAI || false, investor.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
