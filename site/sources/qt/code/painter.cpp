void paintEvent( QPaintEvent * )
{
	QPainter painter( this );
	draw_bar( &painter, 0, 39, Qt::DiagCrossPattern );
	draw_bar( &painter, 2, 44, Qt::FDiagPattern );
	painter.setPen( Qt::black );
	painter.drawLine( 0, 0, 0, height() - 1 );
	painter.drawLine( 0, height() - 1, width() - 1, height() - 1 );
	painter.setFont( QFont("Helvetica", 18) );
	painter.drawText(rect(),Qt::AlignHCenter | Qt::AlignTop,"Ventes");
}
void draw_bar(QPainter *painter, int month, int barHeight, Qt::BrushStyle pattern)
{
	painter->setPen( Qt::blue );
	painter->setBrush( QBrush(Qt::darkGreen, pattern) );
	painter->drawRect( 10 + 30 * month, height() - barHeight, 20, barHeight );
}
