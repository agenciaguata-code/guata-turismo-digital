
-- Cursos seed (idempotente via slug)
WITH c1 AS (
  INSERT INTO public.courses (slug, title, short_description, description, category, level, duration_hours, is_published, cover_url)
  VALUES (
    'atendimento-ao-turista',
    'Atendimento ao Turista',
    'Aprenda boas práticas de hospitalidade, comunicação e resolução de conflitos para encantar visitantes.',
    'Neste curso você vai descobrir os fundamentos do atendimento ao turista, da recepção ao pós-visita. Vamos abordar comunicação intercultural, escuta ativa, atendimento de queixas e como criar experiências memoráveis. Conteúdo prático para guias, hotelaria, gastronomia e atrativos turísticos.',
    'Atendimento',
    'iniciante',
    6,
    true,
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=80'
  )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id
),
c2 AS (
  INSERT INTO public.courses (slug, title, short_description, description, category, level, duration_hours, is_published, cover_url)
  VALUES (
    'guia-de-turismo-regional',
    'Guia de Turismo Regional',
    'Tudo o que um guia precisa saber para conduzir grupos com segurança, técnica e storytelling.',
    'Capacitação completa para guias regionais: legislação, planejamento de roteiro, condução de grupos, primeiros socorros, storytelling e técnicas de interpretação do patrimônio. Foco em destinos brasileiros.',
    'Guiamento',
    'intermediario',
    20,
    true,
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80'
  )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id
),
c3 AS (
  INSERT INTO public.courses (slug, title, short_description, description, category, level, duration_hours, is_published, cover_url)
  VALUES (
    'hospitalidade-e-vendas',
    'Hospitalidade & Vendas',
    'Estratégias para vender experiências turísticas com hospitalidade autêntica e aumento de ticket médio.',
    'Curso avançado para profissionais que querem unir hospitalidade brasileira a técnicas de vendas consultivas. Funil de vendas, upsell, cross-sell, fidelização e gestão da experiência do hóspede.',
    'Hotelaria',
    'avancado',
    12,
    true,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'
  )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id
),
-- Módulos para cada curso
m1 AS (
  INSERT INTO public.modules (course_id, title, order_index)
  SELECT id, 'Fundamentos do atendimento', 1 FROM c1
  UNION ALL
  SELECT id, 'Comunicação e empatia', 2 FROM c1
  RETURNING id, course_id, order_index
),
m2 AS (
  INSERT INTO public.modules (course_id, title, order_index)
  SELECT id, 'Bases legais e segurança', 1 FROM c2
  UNION ALL
  SELECT id, 'Storytelling e condução', 2 FROM c2
  RETURNING id, course_id, order_index
),
m3 AS (
  INSERT INTO public.modules (course_id, title, order_index)
  SELECT id, 'Hospitalidade que vende', 1 FROM c3
  UNION ALL
  SELECT id, 'Funil & fidelização', 2 FROM c3
  RETURNING id, course_id, order_index
)
-- Aulas (uma por módulo, dois módulos por curso = 6 aulas demo)
INSERT INTO public.lessons (module_id, title, description, video_url, video_provider, duration_minutes, order_index, is_free_preview)
SELECT id, 'Boas-vindas e expectativas',
       'Apresentação do curso, do instrutor e o que você vai aprender.',
       'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 8, 1, true
  FROM m1 WHERE order_index = 1
UNION ALL
SELECT id, 'Escuta ativa na prática',
       'Técnicas para entender o turista antes de responder.',
       'https://www.youtube.com/watch?v=9bZkp7q19f0', 'youtube', 12, 1, false
  FROM m1 WHERE order_index = 2
UNION ALL
SELECT id, 'O que diz a lei do turismo',
       'Panorama da legislação aplicada à atividade de guiamento.',
       'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 15, 1, true
  FROM m2 WHERE order_index = 1
UNION ALL
SELECT id, 'Contando boas histórias',
       'Storytelling para transformar fatos em experiências memoráveis.',
       'https://www.youtube.com/watch?v=9bZkp7q19f0', 'youtube', 18, 1, false
  FROM m2 WHERE order_index = 2
UNION ALL
SELECT id, 'Hospitalidade como vantagem competitiva',
       'Por que hospitalidade brasileira vende mais que desconto.',
       'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 14, 1, true
  FROM m3 WHERE order_index = 1
UNION ALL
SELECT id, 'Construindo um funil de fidelização',
       'Da primeira reserva ao cliente que volta todo ano.',
       'https://www.youtube.com/watch?v=9bZkp7q19f0', 'youtube', 20, 1, false
  FROM m3 WHERE order_index = 2;
