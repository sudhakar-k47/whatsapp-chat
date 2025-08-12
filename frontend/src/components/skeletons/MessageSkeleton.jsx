import React from "react";

const MessageSkeleton = () => {
  const skeletonPairs = Array.from({ length: 4 });

  return (
    <div className="p-4 space-y-6">
      {skeletonPairs.map((_, i) => (
        <React.Fragment key={i}>
          {/* Received message */}
          <div className="flex items-start gap-3">
            <div className="skeleton w-10 h-10 rounded-full"></div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-40"></div>
              <div className="skeleton h-4 w-28"></div>
            </div>
          </div>

          {/* Sent message */}
          <div className="flex items-start gap-3 justify-end">
            <div className="space-y-2 text-right">
              <div className="skeleton h-4 w-32 ml-auto"></div>
              <div className="skeleton h-4 w-20 ml-auto"></div>
            </div>
            <div className="skeleton w-10 h-10 rounded-full"></div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageSkeleton;
