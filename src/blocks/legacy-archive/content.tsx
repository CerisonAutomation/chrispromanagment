'use client';

import React from 'react';
import {Check, Clock, Shield, Sparkles, Star, Users, Zap} from 'lucide-react';

// =============================================================================
// FEATURES BLOCK
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Shield,
  Clock,
  Users,
  Sparkles,
  Check,
  Star,
};

export const FeaturesBlock = {
  label: "Features Block",
  fields: {
    title: {
      type: 'text',
      label: 'Section Title',
    },
    subtitle: {
      type: 'text',
      label: 'Section Subtitle',
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Grid 3 Columns', value: 'grid-3' },
        { label: 'Grid 2 Columns', value: 'grid-2' },
        { label: 'Grid 4 Columns', value: 'grid-4' },
        { label: 'List', value: 'list' },
      ],
    },
    feature1Title: {
      type: 'text',
      label: 'Feature 1 Title',
    },
    feature1Description: {
      type: 'textarea',
      label: 'Feature 1 Description',
    },
    feature1Icon: {
      type: 'select',
      label: 'Feature 1 Icon',
      options: [
        { label: 'Zap', value: 'Zap' },
        { label: 'Shield', value: 'Shield' },
        { label: 'Clock', value: 'Clock' },
        { label: 'Users', value: 'Users' },
        { label: 'Sparkles', value: 'Sparkles' },
        { label: 'Check', value: 'Check' },
        { label: 'Star', value: 'Star' },
      ],
    },
    feature2Title: {
      type: 'text',
      label: 'Feature 2 Title',
    },
    feature2Description: {
      type: 'textarea',
      label: 'Feature 2 Description',
    },
    feature2Icon: {
      type: 'select',
      label: 'Feature 2 Icon',
      options: [
        { label: 'Zap', value: 'Zap' },
        { label: 'Shield', value: 'Shield' },
        { label: 'Clock', value: 'Clock' },
        { label: 'Users', value: 'Users' },
        { label: 'Sparkles', value: 'Sparkles' },
        { label: 'Check', value: 'Check' },
        { label: 'Star', value: 'Star' },
      ],
    },
    feature3Title: {
      type: 'text',
      label: 'Feature 3 Title',
    },
    feature3Description: {
      type: 'textarea',
      label: 'Feature 3 Description',
    },
    feature3Icon: {
      type: 'select',
      label: 'Feature 3 Icon',
      options: [
        { label: 'Zap', value: 'Zap' },
        { label: 'Shield', value: 'Shield' },
        { label: 'Clock', value: 'Clock' },
        { label: 'Users', value: 'Users' },
        { label: 'Sparkles', value: 'Sparkles' },
        { label: 'Check', value: 'Check' },
        { label: 'Star', value: 'Star' },
      ],
    },
    backgroundColor: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'White', value: 'bg-white' },
        { label: 'Light', value: 'bg-neutral-50' },
        { label: 'Dark', value: 'bg-neutral-900 text-white' },
      ],
    },
  },
  defaultProps: {
    title: 'Everything You Need',
    subtitle: 'Powerful features to help you succeed',
    layout: 'grid-3',
    feature1Title: 'Lightning Fast',
    feature1Description: 'Build and deploy websites in minutes, not days.',
    feature1Icon: 'Zap',
    feature2Title: 'Secure by Default',
    feature2Description: 'Enterprise-grade security built into every site.',
    feature2Icon: 'Shield',
    feature3Title: '24/7 Support',
    feature3Description: 'Our team is here to help you around the clock.',
    feature3Icon: 'Clock',
    backgroundColor: 'bg-white',
  },
  render: (props: any) => {
    const {
      title, subtitle, layout, backgroundColor,
      feature1Title, feature1Description, feature1Icon,
      feature2Title, feature2Description, feature2Icon,
      feature3Title, feature3Description, feature3Icon,
    } = props;

    const isDark = backgroundColor?.includes('neutral-900');
    const features = [
      { title: feature1Title, description: feature1Description, icon: feature1Icon },
      { title: feature2Title, description: feature2Description, icon: feature2Icon },
      { title: feature3Title, description: feature3Description, icon: feature3Icon },
    ];

    const gridClass = ({
      'grid-2': 'grid md:grid-cols-2 gap-8',
      'grid-3': 'grid md:grid-cols-2 lg:grid-cols-3 gap-8',
      'grid-4': 'grid md:grid-cols-2 lg:grid-cols-4 gap-8',
      'list': 'flex flex-col gap-6',
    } as Record<string, string>)[layout as string] || 'grid md:grid-cols-2 lg:grid-cols-3 gap-8';

    return (
      <section className={`${backgroundColor} w-full py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {title}
            </h2>
            <p className={`mt-4 text-lg ${isDark ? 'text-white/70' : 'text-neutral-600'}`}>
              {subtitle}
            </p>
          </div>
          <div className={gridClass}>
            {features.map((feature, i) => {
              const IconComponent = iconMap[feature.icon] || Zap;
              return (
                <div 
                  key={i} 
                  className={`${layout === 'list' ? 'flex items-start gap-4' : ''} ${isDark ? '' : ''}`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${isDark ? 'bg-white/10' : 'bg-primary/10'}`}>
                    <IconComponent className={`h-6 w-6 ${isDark ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <div className={layout === 'list' ? '' : 'mt-4'}>
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`mt-2 ${isDark ? 'text-white/70' : 'text-neutral-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  },
};

// =============================================================================
// TESTIMONIALS BLOCK
// =============================================================================

export const TestimonialsBlock = {
  label: "Testimonials Block",
  fields: {
    title: {
      type: 'text',
      label: 'Section Title',
    },
    subtitle: {
      type: 'text',
      label: 'Section Subtitle',
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Carousel', value: 'carousel' },
        { label: 'Single Featured', value: 'featured' },
      ],
    },
    testimonial1Name: {
      type: 'text',
      label: 'Testimonial 1 Name',
    },
    testimonial1Role: {
      type: 'text',
      label: 'Testimonial 1 Role',
    },
    testimonial1Content: {
      type: 'textarea',
      label: 'Testimonial 1 Content',
    },
    testimonial1Avatar: {
      type: 'text',
      label: 'Testimonial 1 Avatar URL',
    },
    testimonial2Name: {
      type: 'text',
      label: 'Testimonial 2 Name',
    },
    testimonial2Role: {
      type: 'text',
      label: 'Testimonial 2 Role',
    },
    testimonial2Content: {
      type: 'textarea',
      label: 'Testimonial 2 Content',
    },
    testimonial2Avatar: {
      type: 'text',
      label: 'Testimonial 2 Avatar URL',
    },
    testimonial3Name: {
      type: 'text',
      label: 'Testimonial 3 Name',
    },
    testimonial3Role: {
      type: 'text',
      label: 'Testimonial 3 Role',
    },
    testimonial3Content: {
      type: 'textarea',
      label: 'Testimonial 3 Content',
    },
    testimonial3Avatar: {
      type: 'text',
      label: 'Testimonial 3 Avatar URL',
    },
    backgroundColor: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'White', value: 'bg-white' },
        { label: 'Light', value: 'bg-neutral-50' },
        { label: 'Dark', value: 'bg-neutral-900 text-white' },
        { label: 'Primary', value: 'bg-primary text-white' },
      ],
    },
  },
  defaultProps: {
    title: 'Loved by Thousands',
    subtitle: 'See what our customers have to say',
    layout: 'grid',
    testimonial1Name: 'Sarah Johnson',
    testimonial1Role: 'CEO at TechCorp',
    testimonial1Content: 'This platform has completely transformed how we build websites. What used to take weeks now takes hours.',
    testimonial1Avatar: '',
    testimonial2Name: 'Michael Chen',
    testimonial2Role: 'Marketing Director',
    testimonial2Content: 'The AI-powered features are game-changing. It feels like having a whole design team at your fingertips.',
    testimonial2Avatar: '',
    testimonial3Name: 'Emily Davis',
    testimonial3Role: 'Freelance Designer',
    testimonial3Content: 'I have tried every website builder out there, and this is hands down the best. The flexibility is unmatched.',
    testimonial3Avatar: '',
    backgroundColor: 'bg-neutral-50',
  },
  render: (props: any) => {
    const {
      title, subtitle, layout, backgroundColor,
      testimonial1Name, testimonial1Role, testimonial1Content, testimonial1Avatar,
      testimonial2Name, testimonial2Role, testimonial2Content, testimonial2Avatar,
      testimonial3Name, testimonial3Role, testimonial3Content, testimonial3Avatar,
    } = props;

    const isDark = backgroundColor?.includes('neutral-900') || backgroundColor?.includes('primary');

    const testimonials = [
      { name: testimonial1Name, role: testimonial1Role, content: testimonial1Content, avatar: testimonial1Avatar },
      { name: testimonial2Name, role: testimonial2Role, content: testimonial2Content, avatar: testimonial2Avatar },
      { name: testimonial3Name, role: testimonial3Role, content: testimonial3Content, avatar: testimonial3Avatar },
    ];

    return (
      <section className={`${backgroundColor} w-full py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {title}
            </h2>
            <p className={`mt-4 text-lg ${isDark ? 'text-white/70' : 'text-neutral-600'}`}>
              {subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-white border border-neutral-200'}`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className={`text-lg mb-6 ${isDark ? 'text-white/90' : 'text-neutral-700'}`}>
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  {testimonial.avatar ? (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${isDark ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      {testimonial.name}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
};
