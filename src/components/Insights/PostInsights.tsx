'use client';

import { ViewReactionsPostData } from '@/models/viewReactionsPostResponse';
import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import CommonModalLayer from '../modal/CommonModalLayer';
import Image from 'next/image';
import SafeImage from '../shared/SafeImage';

interface ChartData {
  name: string;
  value: number;
}

interface StatCardProps {
  title: string;
  total?: number;
  followers?: number;
  nonFollowers?: number;
  data?: ViewReactionsPostData;
  isShareCard?: boolean;
}

interface PostInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ViewReactionsPostData | null;
  postInsightsModalCoverfile: string
  aspect?: number
}

const SHARE_COLORS: Record<string, string> = {
  Bigshorts: '#818CF8',
  Whatsapp: '#34D399',
  Instagram: '#F472B6',
  Facebook: '#60A5FA',
  Twitter: '#38BDF8'
};

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-secondary-bg-color/60 backdrop-blur-sm rounded-xl p-5 hover:bg-secondary-bg-color/80 transition-all duration-200">
    <h3 className="text-base font-medium text-primary-text-color mb-4">{title}</h3>
    {children}
  </div>
);

const PostInsightsModal: React.FC<PostInsightsModalProps> = ({ isOpen, onClose, data, postInsightsModalCoverfile, aspect = 0.75 }) => {

  const getLikesAgeData = useMemo(() => {
    const ageCategories = data?.reactions?.likes?.ageCategories;
    if (!ageCategories) return [];
    return [
      { name: 'Under 18', value: ageCategories.under18 || 0 },
      { name: '18-24', value: ageCategories.from18to24 || 0 },
      { name: '25-34', value: ageCategories.from25to34 || 0 },
      { name: '35-44', value: ageCategories.from35to44 || 0 },
      { name: '45-54', value: ageCategories.from45to54 || 0 },
      { name: 'Over 54', value: ageCategories.over54 || 0 }
    ];
  }, [data?.reactions?.likes?.ageCategories]);

  const getLikesTimeData = useMemo(() => {
    const timeCategories = data?.reactions?.likes?.timeCategories;
    if (!timeCategories) return [];
    return [
      { name: '12AM-6AM', value: timeCategories['12to6'] || 0 },
      { name: '6AM-12PM', value: timeCategories['6to12'] || 0 },
      { name: '12PM-6PM', value: timeCategories['12to18'] || 0 },
      { name: '6PM-12AM', value: timeCategories['18to12'] || 0 }
    ];
  }, [data?.reactions?.likes?.timeCategories]);

  if (!isOpen || !data) return null;

  const getSharesData = (shares: ViewReactionsPostData['shares']) => {
    const platforms = ['Bigshorts', 'Whatsapp', 'Instagram', 'Facebook', 'Twitter'];

    const followerShares = shares?.byPlatform?.followers || {};
    const nonFollowerShares = shares?.byPlatform?.nonFollowers || {};

    return platforms.map(platform => {
      const followerShare = followerShares[platform] || 0;
      const nonFollowerShare = nonFollowerShares[platform] || 0;
      const totalShares = followerShare + nonFollowerShare;

      return totalShares > 0 ? { name: platform, value: totalShares } : null;
    }).filter(item => item !== null);
  };

  const StatCard: React.FC<StatCardProps> = ({ title, total, followers, nonFollowers, isShareCard }) => (
    <div className="bg-bg-color backdrop-blur-sm rounded-xl p-5 w-full  transition-all duration-200">
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

        {isShareCard && data && getSharesData(data.shares).length > 0 && (
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
                    entry ? <Cell key={`cell-${entry.name}`} fill={SHARE_COLORS[entry.name]} /> : null
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <CommonModalLayer width='w-full max-w-5xl' height='h-max'
      isModal={false}
      hideCloseButtonOnMobile={true}
      onClose={onClose}
    >
      <div className="relative bg-primary-bg-color backdrop-blur-md md:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-primary-bg-color backdrop-blur-xl border-b border-primary-border-color">
          <h2 className="text-lg font-semibold text-text-color">Post Insights</h2>
        </div>

        <div className='flex items-center justify-center mt-4'>
        <SafeImage
          src={postInsightsModalCoverfile} 
          alt="Post Cover" 
          className="w-48 object-cover rounded-md" 
        />
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard title="Likes" total={data.reactions?.likes?.total} followers={data.reactions?.likes?.followers} nonFollowers={data.reactions?.likes?.nonFollowers} />
            <StatCard title="Shares" total={data.shares?.total} followers={data.shares?.followers} nonFollowers={data.shares?.nonFollowers} isShareCard data={data} />
            <StatCard title="Comments" total={data.comments?.total} followers={data.comments?.followers} nonFollowers={data.comments?.nonFollowers} />
            <StatCard title="Visitors" total={data.visitors?.total} followers={data.visitors?.followers} nonFollowers={data.visitors?.nonFollowers} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ChartCard title="Likes Age Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getLikesAgeData}>
                    <XAxis
                      dataKey="name"
                      interval={0}
                      height={40}
                      fontSize={10}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#818CF8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            <ChartCard title="Likes Time Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getLikesTimeData}>
                    <XAxis
                      dataKey="name"
                      interval={0}
                      height={40}
                      fontSize={10}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#34D399" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

      </div>
    </CommonModalLayer>
  );
};

export default PostInsightsModal;