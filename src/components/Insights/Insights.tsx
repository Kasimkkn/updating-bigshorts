import { AgeCategories, ByPlatform, TimeCategories, ViewReactionsData } from '@/models/viewReactionsResponse';
import React, { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CommonModalLayer from '../modal/CommonModalLayer';

interface StatCardProps {
  title: string;
  total?: number;
  followers?: number;
  nonFollowers?: number;
  extraInfo?: ByPlatform['nonFollowers'];
  data?: ViewReactionsData;
}

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ViewReactionsData | null;
  fecthVideoPostInsights: (postId: number, videoId: number) => Promise<void>;
  postInsightsModalCoverfile: string
}

const InsightsModal: React.FC<InsightsModalProps> = ({ isOpen, onClose, data, fecthVideoPostInsights, postInsightsModalCoverfile }) => {

  const [videoIdIndex, setVideoIdIndex] = useState(0);

  useEffect(() => {
    if (data?.videoIds.length! > 1) {
      fecthVideoPostInsights(data?.postId!, data?.videoIds[videoIdIndex]!);
    }
  }, [videoIdIndex]);

  if (!isOpen || !data) return null;

  const handleLeftArrowClick = () => {
    if (videoIdIndex > 0) {
      setVideoIdIndex(videoIdIndex - 1);
    } else {
      setVideoIdIndex(data?.videoIds.length - 1);
    }
  }

  const handleRightArrowClick = () => {
    if (videoIdIndex < data?.videoIds.length - 1) {
      setVideoIdIndex(videoIdIndex + 1);
    } else {
      setVideoIdIndex(0);
    }
  }


  const getAgeData = (ageCategories: AgeCategories | undefined) => {
    if (!ageCategories) return [];
    return [
      { name: 'Under 18', value: ageCategories.under18 },
      { name: '18-24', value: ageCategories.from18to24 },
      { name: '25-34', value: ageCategories.from25to34 },
      { name: '35-44', value: ageCategories.from35to44 },
      { name: '45-54', value: ageCategories.from45to54 },
      { name: 'Over 54', value: ageCategories.over54 }
    ];
  };

  const getTimeData = (timeCategories: TimeCategories | undefined) => {
    if (!timeCategories) return [];
    return [
      { name: '12AM-6AM', value: timeCategories['12to6'] },
      { name: '6AM-12PM', value: timeCategories['6to12'] },
      { name: '12PM-6PM', value: timeCategories['12to18'] },
      { name: '6PM-12AM', value: timeCategories['18to12'] }
    ];
  };

  const getSharesData = (shares: ViewReactionsData['shares']) => {
    const platforms = ['bigshorts', 'whatsapp', 'instagram', 'facebook', 'twitter'];

    const followerShares = shares?.byPlatform?.followers || {};
    const nonFollowerShares = shares?.byPlatform?.nonFollowers || {};


    return platforms.map(platform => {
      const followerShare = followerShares[platform] || 0;
      const nonFollowerShare = nonFollowerShares[platform] || 0;
      const totalShares = followerShare + nonFollowerShare;
      if (totalShares > 0) {
        return {
          name: platform.charAt(0).toUpperCase() + platform.slice(1),
          value: totalShares
        };
      }
      return null;
    }).filter(item => item !== null);  // Remove null values
  };



  const SHARE_COLORS = {
    Bigshorts: '#818CF8',   // Indigo
    Whatsapp: '#34D399',    // Emerald
    Instagram: '#F472B6',   // Pink
    Facebook: '#60A5FA',    // Blue
    Twitter: '#38BDF8'      // Sky
  };

  const StatCard: React.FC<StatCardProps> = ({ title, total, followers, nonFollowers, extraInfo, data }) => (
    <div className="bg-primary-bg-color backdrop-blur-sm rounded-xl p-5 w-full  transition-all duration-200">
      <div className="mb-3">
        <h3 className="text-base font-medium text-primary-text-color">{title}</h3>
        <p className="text-3xl font-semibold text-text-color mt-1">
          {total?.toLocaleString() || '0'}
        </p>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-primary-text-color">
          <span>Followers</span>
          <span className="font-medium text-primary-text-color">{followers?.toLocaleString() || '0'}</span>
        </div>
        <div className="flex justify-between text-primary-text-color">
          <span>Non-followers</span>
          <span className="font-medium text-primary-text-color">{nonFollowers?.toLocaleString() || '0'}</span>
        </div>
        {title === "Shares" && data?.shares && data.shares.total > 0 && (
          <div className="h-48 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getSharesData(data.shares)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={1}
                  stroke="#1F2937"
                >
                  {getSharesData(data.shares).map((entry) => (
                    <Cell
                      key={`cell-${entry?.name}`}
                      fill={SHARE_COLORS[entry?.name as keyof typeof SHARE_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} shares`, name]}
                  contentStyle={{
                    background: '#1F2937',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: '#E5E7EB', fontSize: '0.875rem' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-primary-text-color text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-primary-bg-color backdrop-blur-sm rounded-xl p-5  transition-all duration-200">
      <h3 className="text-base font-medium text-primary-text-color mb-4">{title}</h3>
      {children}
    </div>
  );

  return (

    <CommonModalLayer width='w-full max-w-5xl' height='h-max'
      isModal={false}
      hideCloseButtonOnMobile={true}
      onClose={onClose}
    >
      <div className="relative bg-bg-color backdrop-blur-md rounded-2xl w-full max-w-4xl max-h-[70vh] md:max-h-[90vh] overflow-y-auto border border-primary-border-color">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-bg-color backdrop-blur-xl border-b border-primary-border-color">
          <h2 className="text-lg font-semibold text-text-color">
            Post Insights
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-primary-text-color hover:text-text-color hover:bg-secondary-bg-color transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className='flex items-center justify-center mt-4'>
          {/* <Image src={postInsightsModalCoverfile} alt="Post Cover" className="h-72 w-48 object-cover" width={300} height={300} /> */}
          <span className='text-2xl text-text-color'>video {videoIdIndex + 1}</span>
        </div>

        <div className="p-5 space-y-5 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              title="Views"
              total={data.views?.viewCount}
              followers={data.views?.followers}
              nonFollowers={data.views?.nonFollowers}
            />
            <StatCard
              title="Likes"
              total={data.reactions?.likes?.total}
              followers={data.reactions?.likes?.followers}
              nonFollowers={data.reactions?.likes?.nonFollowers}
            />
            {/* <StatCard 
              title="Super Likes" 
              total={data.reactions?.superLikes?.total}
              followers={data.reactions?.superLikes?.followers}
              nonFollowers={data.reactions?.superLikes?.nonFollowers}
            /> */}
            <StatCard
              title="Comments"
              total={data.comments?.total}
              followers={data.comments?.followers}
              nonFollowers={data.comments?.nonFollowers}
            />
            <StatCard
              title="Shares"
              total={data.shares?.total}
              followers={data.shares?.followers}
              nonFollowers={data.shares?.nonFollowers}
              data={data}
            />
            <StatCard
              title="Visitors"
              total={data.visitors?.total}
              followers={data.visitors?.followers}
              nonFollowers={data.visitors?.nonFollowers}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {data.views?.ageCategories && (
              <ChartCard title="Viewing Age Distribution">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getAgeData(data.views.ageCategories)} barGap={0}>
                      <CartesianGrid vertical={false} stroke="#374151" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip
                        cursor={{ fill: '#374151', opacity: 0.2 }}
                        contentStyle={{
                          background: '#1F2937',
                          border: 'none',
                          borderRadius: '0.75rem',
                          padding: '0.75rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        itemStyle={{ color: '#E5E7EB', fontSize: '0.875rem' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#818CF8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            {data.views?.timeCategories && (
              <ChartCard title="Viewing Time Distribution">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTimeData(data.views.timeCategories)} barGap={0}>
                      <CartesianGrid vertical={false} stroke="#374151" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip
                        cursor={{ fill: '#374151', opacity: 0.2 }}
                        contentStyle={{
                          background: '#1F2937',
                          border: 'none',
                          borderRadius: '0.75rem',
                          padding: '0.75rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        itemStyle={{ color: '#E5E7EB', fontSize: '0.875rem' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#34D399"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>
        </div>

        {data?.totalVideos > 1 && (
          <>
            <button
              disabled={videoIdIndex === 0}
              onClick={handleLeftArrowClick}
              className={`absolute ${videoIdIndex === 0 ? 'opacity-0' : ''} left-2 top-1/2 -translate-y-1/2 bg-primary-bg-color rounded-full p-2 `}
            >
              <FaChevronLeft />
            </button>

            <button
              disabled={videoIdIndex === data.totalVideos - 1}
              onClick={handleRightArrowClick}
              className={`absolute ${videoIdIndex === data.totalVideos - 1 ? 'opacity-0' : ''} right-2 top-1/2 -translate-y-1/2 bg-primary-bg-color rounded-full p-2 `}
            >
              <FaChevronRight />
            </button>
          </>
        )}


      </div>
    </CommonModalLayer>
  );
};

export default InsightsModal;